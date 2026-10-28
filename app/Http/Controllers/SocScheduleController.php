<?php

namespace App\Http\Controllers;

use App\Models\Hospcode;
use App\Models\SocShiftSchedule;
use App\Models\SocTopic;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SocScheduleController extends Controller
{
    /**
     * Display the SOC Duty Roster & Surveillance Calendar.
     */
    public function index(Request $request): Response
    {
        $now = Carbon::now();
        $monthParam = $request->input('month', $now->format('Y-m'));

        try {
            $currentMonth = Carbon::createFromFormat('Y-m', $monthParam)->startOfMonth();
        } catch (\Exception $e) {
            $currentMonth = $now->copy()->startOfMonth();
        }

        $startOfMonth = $currentMonth->copy()->startOfMonth();
        $endOfMonth = $currentMonth->copy()->endOfMonth();

        // Auto-seed initial demo shifts if the table is completely empty
        if (SocShiftSchedule::count() === 0) {
            $this->seedInitialMonthSchedules($startOfMonth, $endOfMonth);
        }

        // Auto-reconcile any scheduled shifts that already have a matching SOC report submitted
        $this->reconcileSchedulesWithReports($startOfMonth, $endOfMonth);

        // Build query for the selected month (include padding days for calendar grid)
        $gridStart = $startOfMonth->copy()->startOfWeek(Carbon::SUNDAY);
        $gridEnd = $endOfMonth->copy()->endOfWeek(Carbon::SATURDAY);

        $query = SocShiftSchedule::with([
            'user:id,name,provider_id,role,agency_code,agency_name,hospcode,hname_th,position,phone',
            'backupUser:id,name,provider_id,agency_name,hname_th,position',
            'socTopic:id,title,severity,status,created_at',
        ])->whereBetween('shift_date', [$gridStart->toDateString(), $gridEnd->toDateString()]);

        if ($userId = $request->input('user_id')) {
            if ($userId !== 'all') {
                $query->where(function ($q) use ($userId) {
                    $q->where('user_id', $userId)
                        ->orWhere('backup_user_id', $userId);
                });
            }
        }

        if ($shiftType = $request->input('shift_type')) {
            if ($shiftType !== 'all') {
                $query->where('shift_type', $shiftType);
            }
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($agencyCode = $request->input('agency_code')) {
            if ($agencyCode !== 'all') {
                $query->where('agency_code', $agencyCode);
            }
        }

        $shiftOrder = "CASE shift_type WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 WHEN 'night' THEN 3 WHEN 'daily' THEN 4 ELSE 5 END";
        $schedules = $query->orderBy('shift_date', 'asc')
            ->orderByRaw($shiftOrder)
            ->get()
            ->map(fn ($item) => $this->formatScheduleItem($item));

        // Today's active shifts (always fetched regardless of month filter so operators see today's watch)
        $todayStr = $now->toDateString();
        $todayShifts = SocShiftSchedule::with([
            'user:id,name,provider_id,role,agency_code,agency_name,hospcode,hname_th,position,phone',
            'backupUser:id,name,provider_id,agency_name,hname_th,position',
            'socTopic:id,title,severity,status,created_at',
        ])
            ->whereDate('shift_date', $todayStr)
            ->orderByRaw($shiftOrder)
            ->get()
            ->map(fn ($item) => $this->formatScheduleItem($item));

        // Month KPI stats & member workload breakdown
        $monthSchedulesAll = SocShiftSchedule::with('user:id,name,provider_id,agency_name,hname_th,position')
            ->whereBetween('shift_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->get();

        $totalShifts = $monthSchedulesAll->count();
        $completedShifts = $monthSchedulesAll->where('status', 'completed')->count();
        $checkedInShifts = $monthSchedulesAll->where('status', 'checked_in')->count();
        $pastOrTodayShifts = $monthSchedulesAll->filter(fn ($s) => $s->shift_date->lte($now->copy()->endOfDay()))->count();
        $overdueShifts = $monthSchedulesAll->filter(function ($s) use ($now) {
            return $s->shift_date->lt($now->copy()->startOfDay()) && $s->status !== 'completed';
        })->count();

        $complianceRate = $pastOrTodayShifts > 0
            ? round(($completedShifts / $pastOrTodayShifts) * 100, 1)
            : 100.0;

        // Member workload summary
        $members = User::where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'name', 'provider_id', 'role', 'agency_code', 'agency_name', 'hospcode', 'hname_th', 'position', 'phone'])
            ->map(function ($u) use ($monthSchedulesAll) {
                $userShifts = $monthSchedulesAll->where('user_id', $u->id);
                $backupShifts = $monthSchedulesAll->where('backup_user_id', $u->id);
                $completedCount = $userShifts->where('status', 'completed')->count();

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'provider_id' => $u->provider_id,
                    'role' => $u->role,
                    'agency_code' => $u->hospcode ?: $u->agency_code,
                    'agency_name' => $u->hname_th ?: $u->agency_name,
                    'position' => $u->position ?: 'เจ้าหน้าที่เฝ้าระวัง SOC',
                    'phone' => $u->phone,
                    'total_shifts' => $userShifts->count(),
                    'backup_shifts' => $backupShifts->count(),
                    'completed_shifts' => $completedCount,
                    'morning_count' => $userShifts->where('shift_type', 'morning')->count(),
                    'afternoon_count' => $userShifts->where('shift_type', 'afternoon')->count(),
                    'night_count' => $userShifts->where('shift_type', 'night')->count(),
                    'daily_count' => $userShifts->where('shift_type', 'daily')->count(),
                ];
            });

        $hospcodes = Hospcode::orderBy('hospcode')
            ->get(['hospcode', 'name', 'hosptype'])
            ->map(fn ($item) => [
                'code' => $item->hospcode,
                'hospcode' => $item->hospcode,
                'name' => $item->name,
                'type' => $item->hosptype ?? '',
            ])
            ->toArray();

        if (empty($hospcodes)) {
            $hospcodes = UserController::$agencies;
        }

        return Inertia::render('Schedule/Index', [
            'schedules' => $schedules,
            'todayShifts' => $todayShifts,
            'members' => $members,
            'hospcodes' => $hospcodes,
            'currentMonth' => $currentMonth->format('Y-m'),
            'monthLabel' => $this->getThaiMonthYearLabel($currentMonth),
            'todayDate' => $todayStr,
            'filters' => [
                'month' => $currentMonth->format('Y-m'),
                'user_id' => $request->input('user_id', 'all'),
                'shift_type' => $request->input('shift_type', 'all'),
                'status' => $request->input('status', 'all'),
                'agency_code' => $request->input('agency_code', 'all'),
            ],
            'stats' => [
                'total_shifts' => $totalShifts,
                'completed_shifts' => $completedShifts,
                'checked_in_shifts' => $checkedInShifts,
                'overdue_shifts' => $overdueShifts,
                'compliance_rate' => $complianceRate,
                'active_members' => $members->where('total_shifts', '>', 0)->count(),
            ],
            'shiftTypeLabels' => SocShiftSchedule::$shiftTypeLabels,
            'statusLabels' => SocShiftSchedule::$statusLabels,
            'roleLabels' => SocShiftSchedule::$roleLabels,
        ]);
    }

    /**
     * Store a newly assigned shift schedule.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shift_date' => ['required', 'date'],
            'shift_type' => ['required', 'string', 'in:morning,afternoon,night,daily'],
            'user_id' => ['required', 'exists:users,id'],
            'backup_user_id' => ['nullable', 'exists:users,id', 'different:user_id'],
            'role_in_shift' => ['required', 'string', 'in:operator,supervisor'],
            'handover_notes' => ['nullable', 'string', 'max:1000'],
        ], [
            'shift_date.required' => 'กรุณาระบุวันที่เข้าเวร',
            'shift_type.required' => 'กรุณาเลือกกะเวลาเข้าเวร',
            'user_id.required' => 'กรุณาเลือกสมาชิกผู้เข้าเวรหลัก',
            'backup_user_id.different' => 'ผู้เข้าเวรสำรองต้องไม่ใช่คนเดียวกับผู้เข้าเวรหลัก',
        ]);

        $assignedUser = User::findOrFail($validated['user_id']);
        $agencyCode = $assignedUser->hospcode ?: $assignedUser->agency_code;
        $agencyName = $assignedUser->hname_th ?: $assignedUser->agency_name;

        SocShiftSchedule::create([
            'shift_date' => $validated['shift_date'],
            'shift_type' => $validated['shift_type'],
            'user_id' => $assignedUser->id,
            'backup_user_id' => $validated['backup_user_id'] ?? null,
            'agency_code' => $agencyCode,
            'agency_name' => $agencyName,
            'role_in_shift' => $validated['role_in_shift'],
            'status' => 'scheduled',
            'handover_notes' => $validated['handover_notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', "มอบหมายเวรให้ {$assignedUser->name} ในวันที่ {$validated['shift_date']} เรียบร้อยแล้ว");
    }

    /**
     * Update an existing shift assignment.
     */
    public function update(Request $request, SocShiftSchedule $schedule): RedirectResponse
    {
        $validated = $request->validate([
            'shift_date' => ['required', 'date'],
            'shift_type' => ['required', 'string', 'in:morning,afternoon,night,daily'],
            'user_id' => ['required', 'exists:users,id'],
            'backup_user_id' => ['nullable', 'exists:users,id', 'different:user_id'],
            'role_in_shift' => ['required', 'string', 'in:operator,supervisor'],
            'status' => ['required', 'string', 'in:scheduled,checked_in,completed,missed'],
            'handover_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $assignedUser = User::findOrFail($validated['user_id']);
        $agencyCode = $assignedUser->hospcode ?: $assignedUser->agency_code;
        $agencyName = $assignedUser->hname_th ?: $assignedUser->agency_name;

        $schedule->update([
            'shift_date' => $validated['shift_date'],
            'shift_type' => $validated['shift_type'],
            'user_id' => $assignedUser->id,
            'backup_user_id' => $validated['backup_user_id'] ?: null,
            'agency_code' => $agencyCode,
            'agency_name' => $agencyName,
            'role_in_shift' => $validated['role_in_shift'],
            'status' => $validated['status'],
            'handover_notes' => $validated['handover_notes'] ?? null,
        ]);

        return back()->with('success', "อัปเดตข้อมูลตารางเวรของ {$assignedUser->name} เรียบร้อยแล้ว");
    }

    /**
     * Delete a shift assignment.
     */
    public function destroy(SocShiftSchedule $schedule): RedirectResponse
    {
        $userName = $schedule->user?->name ?? 'ผู้ใช้งาน';
        $dateStr = $schedule->shift_date?->format('d/m/Y');
        $schedule->delete();

        return back()->with('success', "ลบรายการเวรของ {$userName} วันที่ {$dateStr} เรียบร้อยแล้ว");
    }

    /**
     * Auto-generate balanced monthly rotation roster for selected members.
     */
    public function autoGenerate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'string'],
            'pattern' => ['required', 'string', 'in:three_shifts,two_shifts,daily_watch,weekday_only'],
            'member_ids' => ['required', 'array', 'min:1'],
            'member_ids.*' => ['exists:users,id'],
            'assign_backup' => ['boolean'],
            'clear_existing' => ['boolean'],
        ], [
            'member_ids.required' => 'กรุณาเลือกสมาชิกอย่างน้อย 1 คนเพื่อจัดตารางเวร',
            'member_ids.min' => 'กรุณาเลือกสมาชิกอย่างน้อย 1 คนเพื่อจัดตารางเวร',
        ]);

        try {
            $targetMonth = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        } catch (\Exception $e) {
            $targetMonth = Carbon::now()->startOfMonth();
        }

        $start = $targetMonth->copy()->startOfMonth();
        $end = $targetMonth->copy()->endOfMonth();

        if ($request->boolean('clear_existing', false)) {
            // Only clear uncompleted shifts in that month
            SocShiftSchedule::whereBetween('shift_date', [$start->toDateString(), $end->toDateString()])
                ->where('status', '!=', 'completed')
                ->delete();
        }

        $members = User::whereIn('id', $validated['member_ids'])->get()->values();
        if ($members->isEmpty()) {
            return back()->with('error', 'ไม่พบข้อมูลสมาชิกที่เลือก');
        }

        $memberCount = $members->count();
        $assignBackup = $request->boolean('assign_backup', false) && $memberCount > 1;
        $pattern = $validated['pattern'];

        $shiftsPerDay = match ($pattern) {
            'three_shifts' => ['morning', 'afternoon', 'night'],
            'two_shifts' => ['morning', 'afternoon'],
            'daily_watch' => ['daily'],
            'weekday_only' => ['morning', 'afternoon'],
            default => ['daily'],
        };

        $pointer = 0;
        $createdCount = 0;
        $period = CarbonPeriod::create($start, $end);

        foreach ($period as $date) {
            $dateStr = $date->toDateString();

            // If weekday_only, assign 1 daily on-call shift on weekends
            $dayShifts = ($pattern === 'weekday_only' && $date->isWeekend())
                ? ['daily']
                : $shiftsPerDay;

            foreach ($dayShifts as $shiftType) {
                // Skip if a shift of this type already exists on this date
                $exists = SocShiftSchedule::whereDate('shift_date', $dateStr)
                    ->where('shift_type', $shiftType)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $primaryUser = $members[$pointer % $memberCount];
                $backupUser = $assignBackup ? $members[($pointer + 1) % $memberCount] : null;
                $pointer++;

                SocShiftSchedule::create([
                    'shift_date' => $dateStr,
                    'shift_type' => $shiftType,
                    'user_id' => $primaryUser->id,
                    'backup_user_id' => $backupUser?->id,
                    'agency_code' => $primaryUser->hospcode ?: $primaryUser->agency_code,
                    'agency_name' => $primaryUser->hname_th ?: $primaryUser->agency_name,
                    'role_in_shift' => $primaryUser->role === 'admin' ? 'supervisor' : 'operator',
                    'status' => 'scheduled',
                    'handover_notes' => $this->getDefaultChecklistNote($shiftType),
                    'created_by' => Auth::id(),
                ]);

                $createdCount++;
            }
        }

        return back()->with('success', "จัดตารางเวรหมุนเวียนอัตโนมัติสำเร็จ (สร้างใหม่ {$createdCount} กะเวร สำหรับสมาชิก {$memberCount} คน)");
    }

    /**
     * Check-in to start watching a scheduled shift.
     */
    public function checkIn(SocShiftSchedule $schedule): RedirectResponse
    {
        $schedule->update([
            'status' => 'checked_in',
            'checked_in_at' => Carbon::now(),
        ]);

        return back()->with('success', "เช็คอินเริ่มปฏิบัติหน้าที่เฝ้าระวังเวร ({$schedule->user?->name}) เรียบร้อยแล้ว");
    }

    /**
     * Submit SOC surveillance report directly from a calendar shift and link to SocTopic.
     */
    public function submitReport(Request $request, SocShiftSchedule $schedule): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'severity' => ['required', 'string', 'in:info,normal,low,medium,high,critical'],
            'system_affected' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
            'handover_notes' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ], [
            'title.required' => 'กรุณาระบุหัวข้อรายงานผลการเฝ้าระวัง',
            'system_affected.required' => 'กรุณาระบุระบบที่ทำการเฝ้าระวัง',
            'content.required' => 'กรุณาระบุรายละเอียดผลการเฝ้าระวัง',
            'content.min' => 'รายละเอียดผลการเฝ้าระวังต้องมีความยาวอย่างน้อย 10 ตัวอักษร',
            'image.image' => 'ไฟล์แนบต้องเป็นรูปภาพเท่านั้น',
            'image.max' => 'ขนาดรูปภาพต้องไม่เกิน 5 MB',
            'images.*.image' => 'ไฟล์แนบต้องเป็นรูปภาพเท่านั้น',
            'images.*.max' => 'ขนาดรูปภาพแต่ละไฟล์ต้องไม่เกิน 5 MB',
        ]);

        $user = Auth::user();
        $shiftUser = $schedule->user ?? $user;

        $contentBody = $validated['content'];
        if (! empty($validated['handover_notes'])) {
            $contentBody .= "\n\n---\n**📌 บันทึกส่งมอบเวรกะถัดไป (Handover Notes):**\n" . $validated['handover_notes'];
        }

        // Handle uploaded images
        Storage::disk('public')->makeDirectory('soc_reports');
        $uploadedPaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imgFile) {
                if ($imgFile && $imgFile->isValid()) {
                    $path = $imgFile->store('soc_reports', 'public');
                    if ($path) {
                        $uploadedPaths[] = '/storage/' . $path;
                    }
                }
            }
        } elseif ($request->hasFile('image')) {
            $singleImg = $request->file('image');
            if ($singleImg && $singleImg->isValid()) {
                $path = $singleImg->store('soc_reports', 'public');
                if ($path) {
                    $uploadedPaths[] = '/storage/' . $path;
                }
            }
        }

        // Create corresponding SOC Report in soc_topics
        $topic = SocTopic::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'category' => 'soc_report',
            'severity' => $validated['severity'],
            'status' => in_array($validated['severity'], ['high', 'critical']) ? 'open' : 'resolved',
            'agency_code' => $schedule->agency_code ?: ($shiftUser->hospcode ?: $shiftUser->agency_code),
            'agency_name' => $schedule->agency_name ?: ($shiftUser->hname_th ?: $shiftUser->agency_name),
            'shift' => $schedule->shift_type,
            'shift_date' => $schedule->shift_date->toDateString(),
            'system_affected' => $validated['system_affected'],
            'image_path' => ! empty($uploadedPaths) ? $uploadedPaths[0] : null,
            'images' => ! empty($uploadedPaths) ? $uploadedPaths : null,
            'content' => $contentBody,
            'resolved_by' => in_array($validated['severity'], ['high', 'critical']) ? null : $user->id,
            'resolved_at' => in_array($validated['severity'], ['high', 'critical']) ? null : Carbon::now(),
        ]);

        $schedule->update([
            'status' => 'completed',
            'soc_topic_id' => $topic->id,
            'checked_in_at' => $schedule->checked_in_at ?? Carbon::now(),
            'completed_at' => Carbon::now(),
            'handover_notes' => $validated['handover_notes'] ?? $schedule->handover_notes,
        ]);

        return back()->with('success', "บันทึกรายงานผลการเฝ้าระวังศูนย์ SOC และอัปเดตสถานะตารางเวรเรียบร้อยแล้ว (รหัสรายงาน #{$topic->id})");
    }

    /**
     * Format a SocShiftSchedule model for frontend consumption.
     */
    private function formatScheduleItem(SocShiftSchedule $item): array
    {
        $now = Carbon::now();
        $isPastDay = $item->shift_date->lt($now->copy()->startOfDay());
        $effectiveStatus = $item->status;

        if ($isPastDay && $item->status === 'scheduled') {
            $effectiveStatus = 'missed';
        }

        return [
            'id' => $item->id,
            'shift_date' => $item->shift_date->toDateString(),
            'shift_date_ formatted' => $item->shift_date->format('d/m/Y'),
            'shift_date_display' => $item->shift_date->format('d/m/Y'),
            'shift_type' => $item->shift_type,
            'shift_label' => SocShiftSchedule::$shiftTypeLabels[$item->shift_type] ?? $item->shift_type,
            'user_id' => $item->user_id,
            'user_name' => $item->user?->name ?? 'ไม่ระบุชื่อ',
            'user_provider_id' => $item->user?->provider_id ?? '-',
            'user_position' => $item->user?->position ?: 'เจ้าหน้าที่ศูนย์ SOC',
            'user_phone' => $item->user?->phone,
            'backup_user_id' => $item->backup_user_id,
            'backup_user_name' => $item->backupUser?->name,
            'backup_user_provider_id' => $item->backupUser?->provider_id,
            'agency_code' => $item->agency_code ?: ($item->user?->hospcode ?: $item->user?->agency_code),
            'agency_name' => $item->agency_name ?: ($item->user?->hname_th ?: $item->user?->agency_name),
            'role_in_shift' => $item->role_in_shift,
            'role_label' => SocShiftSchedule::$roleLabels[$item->role_in_shift] ?? $item->role_in_shift,
            'status' => $effectiveStatus,
            'raw_status' => $item->status,
            'status_label' => SocShiftSchedule::$statusLabels[$effectiveStatus] ?? $effectiveStatus,
            'soc_topic_id' => $item->soc_topic_id,
            'soc_topic_title' => $item->socTopic?->title,
            'soc_topic_severity' => $item->socTopic?->severity,
            'checked_in_at' => $item->checked_in_at?->format('H:i น.'),
            'completed_at' => $item->completed_at?->format('d/m/Y H:i น.'),
            'handover_notes' => $item->handover_notes,
        ];
    }

    /**
     * Reconcile scheduled shifts with any matching SOC reports submitted via Webboard.
     */
    private function reconcileSchedulesWithReports(Carbon $start, Carbon $end): void
    {
        $pendingSchedules = SocShiftSchedule::whereBetween('shift_date', [$start->toDateString(), $end->toDateString()])
            ->whereNull('soc_topic_id')
            ->get();

        if ($pendingSchedules->isEmpty()) {
            return;
        }

        $reports = SocTopic::where('category', 'soc_report')
            ->whereBetween('shift_date', [$start->toDateString(), $end->toDateString()])
            ->get();

        foreach ($pendingSchedules as $sched) {
            $matchedReport = $reports->first(function ($rep) use ($sched) {
                $sameDate = $rep->shift_date && $rep->shift_date->toDateString() === $sched->shift_date->toDateString();
                $sameUser = $rep->user_id === $sched->user_id || $rep->user_id === $sched->backup_user_id;
                $sameShift = $rep->shift === $sched->shift_type || $rep->shift === 'daily';

                return $sameDate && ($sameUser || $sameShift);
            });

            if ($matchedReport) {
                $sched->update([
                    'status' => 'completed',
                    'soc_topic_id' => $matchedReport->id,
                    'completed_at' => $matchedReport->created_at,
                ]);
            }
        }
    }

    /**
     * Seed realistic initial monthly schedule for existing active users when table is empty.
     */
    private function seedInitialMonthSchedules(Carbon $start, Carbon $end): void
    {
        $users = User::where('is_active', true)->orderBy('id')->get()->values();
        if ($users->isEmpty()) {
            return;
        }

        $count = $users->count();
        $now = Carbon::now();
        $period = CarbonPeriod::create($start, $end);
        $idx = 0;

        foreach ($period as $date) {
            $dateStr = $date->toDateString();
            $isPast = $date->lt($now->copy()->startOfDay());
            $isToday = $date->isSameDay($now);

            // Assign Morning and Afternoon shifts on weekdays, and Daily Watch on weekends
            $shifts = $date->isWeekend() ? ['daily'] : ['morning', 'afternoon'];

            foreach ($shifts as $shiftIndex => $shiftType) {
                $primary = $users[$idx % $count];
                $backup = $count > 1 ? $users[($idx + 1) % $count] : null;
                $idx++;

                $status = 'scheduled';
                $checkedInAt = null;
                $completedAt = null;
                $topicId = null;

                if ($isPast) {
                    // Mark most past shifts as completed so KPIs look realistic
                    if (($idx % 7) !== 0) {
                        $status = 'completed';
                        $checkedInAt = $date->copy()->setTime($shiftType === 'afternoon' ? 16 : 8, 5);
                        $completedAt = $date->copy()->setTime($shiftType === 'afternoon' ? 23 : 15, 45);
                    } else {
                        $status = 'scheduled'; // Will render as missed/overdue
                    }
                } elseif ($isToday) {
                    if ($shiftIndex === 0) {
                        $status = 'checked_in';
                        $checkedInAt = $now->copy()->subHours(2);
                    }
                }

                SocShiftSchedule::create([
                    'shift_date' => $dateStr,
                    'shift_type' => $shiftType,
                    'user_id' => $primary->id,
                    'backup_user_id' => $backup?->id,
                    'agency_code' => $primary->hospcode ?: $primary->agency_code,
                    'agency_name' => $primary->hname_th ?: $primary->agency_name,
                    'role_in_shift' => $primary->role === 'admin' ? 'supervisor' : 'operator',
                    'status' => $status,
                    'soc_topic_id' => $topicId,
                    'checked_in_at' => $checkedInAt,
                    'completed_at' => $completedAt,
                    'handover_notes' => $this->getDefaultChecklistNote($shiftType),
                    'created_by' => $users->first()->id,
                ]);
            }
        }
    }

    /**
     * Default surveillance note by shift type.
     */
    private function getDefaultChecklistNote(string $shiftType): string
    {
        return match ($shiftType) {
            'morning' => 'ตรวจสอบสถานะ Wazuh Agent 13 โรงพยาบาล, ทรัพยากรแม่ข่ายหลัก และสรุปเหตุการณ์ช่วงเช้า',
            'afternoon' => 'เฝ้าระวังทราฟฟิกเครือข่าย VPN, ตรวจสอบสถานะการสำรองข้อมูล (HIS Backup) และแจ้งเตือนภัยคุกคาม',
            'night' => 'เฝ้าระวังการโจมตีช่วงดึก (Brute Force / Ransomware / Port Scan) และเตรียมส่งมอบเวรเช้า',
            default => 'เฝ้าระวังภาพรวมความมั่นคงปลอดภัยศูนย์ SOC ตลอด 24 ชม. และประสานงานผู้ดูแลระบบโรงพยาบาลเมื่อพบเหตุผิดปกติ',
        };
    }

    /**
     * Format Carbon month into Thai Month + Buddhist Era year.
     */
    private function getThaiMonthYearLabel(Carbon $date): string
    {
        $thaiMonths = [
            1 => 'มกราคม',
            2 => 'กุมภาพันธ์',
            3 => 'มีนาคม',
            4 => 'เมษายน',
            5 => 'พฤษภาคม',
            6 => 'มิถุนายน',
            7 => 'กรกฎาคม',
            8 => 'สิงหาคม',
            9 => 'กันยายน',
            10 => 'ตุลาคม',
            11 => 'พฤศจิกายน',
            12 => 'ธันวาคม',
        ];

        $monthName = $thaiMonths[(int) $date->format('n')] ?? $date->format('F');
        $thaiYear = (int) $date->format('Y') + 543;

        return "{$monthName} {$thaiYear}";
    }
}

