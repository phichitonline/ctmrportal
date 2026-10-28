<?php

namespace App\Http\Controllers;

use App\Models\AgencyTask;
use App\Models\SocShiftSchedule;
use App\Models\SocTopic;
use App\Models\StepAttachment;
use App\Models\User;
use App\Services\WazuhApiService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected WazuhApiService $wazuhService;

    public function __construct(WazuhApiService $wazuhService)
    {
        $this->wazuhService = $wazuhService;
    }

    /**
     * Display the CTMR R3 Phichit MIS Admin Overview Dashboard.
     */
    public function index(): Response
    {
        $agentsSummary = $this->wazuhService->getAgentsSummary();
        $hospitalsAgents = $this->wazuhService->getHospitalAgentsBreakdown();
        $alertsSummary = $this->wazuhService->getAlertsSummary();
        $connectionStatus = $this->wazuhService->getConnectionStatus();

        // 1. Latest SOC Shift Report
        $latestShiftReport = SocTopic::where('category', 'soc_report')
            ->with(['user:id,name,role,agency_name', 'resolvedByUser:id,name'])
            ->withCount('comments')
            ->orderByDesc('created_at')
            ->first();

        // 2. Active Incidents / Alerts needing attention
        $activeIncidents = SocTopic::whereIn('severity', ['high', 'critical'])
            ->whereIn('status', ['open', 'in_progress'])
            ->with(['user:id,name,role,agency_name'])
            ->withCount('comments')
            ->orderByDesc('created_at')
            ->take(3)
            ->get();

        // 3. Recent Webboard Topics Feed
        $recentWebboardTopics = SocTopic::with(['user:id,name,role,agency_name'])
            ->withCount('comments')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->take(4)
            ->get();

        // 4. Daily SOC Webboard Stats
        $today = Carbon::today()->toDateString();
        $socWebboardSummary = [
            'today_reports_count' => SocTopic::where('category', 'soc_report')
                ->where(function ($q) use ($today) {
                    $q->whereDate('shift_date', $today)
                      ->orWhereDate('created_at', $today);
                })->count(),
            'open_issues_count' => SocTopic::whereIn('status', ['open', 'in_progress'])->count(),
            'critical_alerts_count' => SocTopic::whereIn('severity', ['high', 'critical'])
                ->whereIn('status', ['open', 'in_progress'])
                ->count(),
            'resolved_today_count' => SocTopic::where('status', 'resolved')
                ->whereDate('resolved_at', $today)
                ->count(),
            'latest_shift_report' => $latestShiftReport,
            'active_incidents' => $activeIncidents,
            'recent_topics' => $recentWebboardTopics,
        ];

        // 5. Agency Documents & Step Timeline Summary
        $agencyTasksQuery = AgencyTask::query();
        $totalAgencyTasks = (clone $agencyTasksQuery)->count();
        $completedAgencyTasks = (clone $agencyTasksQuery)->where('status', 'completed')->count();
        $inProgressAgencyTasks = (clone $agencyTasksQuery)->where('status', 'in_progress')->count();
        $pendingAgencyTasks = (clone $agencyTasksQuery)->where('status', 'pending')->count();

        // Total documents in repository and breakdown by type
        $totalAgencyDocs = StepAttachment::count();
        $docsByType = [
            'pdf' => StepAttachment::where('file_type', 'pdf')->count(),
            'word' => StepAttachment::where('file_type', 'word')->count(),
            'excel' => StepAttachment::where('file_type', 'excel')->count(),
            'powerpoint' => StepAttachment::where('file_type', 'powerpoint')->count(),
        ];

        // Active Tasks with Timeline progress
        $recentAgencyTasks = AgencyTask::with(['user:id,name', 'steps'])
            ->withCount(['steps', 'attachments'])
            ->orderBy('is_pinned', 'desc')
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'title' => $t->title,
                    'agency_code' => $t->agency_code,
                    'agency_name' => $t->agency_name,
                    'category' => $t->category,
                    'priority' => $t->priority,
                    'status' => $t->status,
                    'progress_percent' => $t->progress_percent,
                    'due_date' => $t->due_date ? $t->due_date->format('d/m/Y') : null,
                    'steps_count' => $t->steps_count,
                    'attachments_count' => $t->attachments_count,
                ];
            });

        // Latest Uploaded Report Documents
        $latestAgencyDocs = StepAttachment::with(['task:id,title,agency_name,agency_code', 'step:id,title,step_number', 'user:id,name'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'file_name' => $doc->file_name,
                    'file_type' => $doc->file_type,
                    'file_size' => $doc->formatted_size,
                    'description' => $doc->description,
                    'created_at' => $doc->created_at->diffForHumans(),
                    'task_title' => $doc->task?->title,
                    'task_id' => $doc->task_id,
                    'agency_name' => $doc->task?->agency_name,
                    'step_title' => $doc->step?->title,
                ];
            });

        $agencyDocsSummary = [
            'total_tasks' => $totalAgencyTasks,
            'completed_tasks' => $completedAgencyTasks,
            'in_progress_tasks' => $inProgressAgencyTasks,
            'pending_tasks' => $pendingAgencyTasks,
            'total_docs' => $totalAgencyDocs,
            'docs_by_type' => $docsByType,
            'recent_tasks' => $recentAgencyTasks,
            'latest_docs' => $latestAgencyDocs,
        ];

        // 6. SOC Duty Schedule & On-Duty Status Summary
        $socScheduleSummary = $this->getSocScheduleSummary();

        return Inertia::render('Dashboard', [
            'agentsSummary' => $agentsSummary,
            'hospitalsAgents' => $hospitalsAgents,
            'alertsSummary' => $alertsSummary,
            'connectionStatus' => $connectionStatus,
            'socWebboardSummary' => $socWebboardSummary,
            'agencyDocsSummary' => $agencyDocsSummary,
            'socScheduleSummary' => $socScheduleSummary,
            'lastUpdated' => Carbon::now()->timezone('Asia/Bangkok')->format('H:i:s'),
        ]);
    }

    /**
     * Build summary of today's on-duty shifts, tomorrow's roster, and monthly compliance KPIs.
     */
    protected function getSocScheduleSummary(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Ensure initial schedule exists if table is empty
        if (SocShiftSchedule::count() === 0) {
            $users = User::where('is_active', true)->orderBy('id')->get()->values();
            if ($users->isNotEmpty()) {
                $count = $users->count();
                $period = CarbonPeriod::create($startOfMonth, $endOfMonth);
                $idx = 0;

                foreach ($period as $date) {
                    $dateStr = $date->toDateString();
                    $isPast = $date->lt($now->copy()->startOfDay());
                    $isToday = $date->isSameDay($now);
                    $shifts = $date->isWeekend() ? ['daily'] : ['morning', 'afternoon'];

                    foreach ($shifts as $shiftIndex => $shiftType) {
                        $primary = $users[$idx % $count];
                        $backup = $count > 1 ? $users[($idx + 1) % $count] : null;
                        $idx++;

                        $status = 'scheduled';
                        $checkedInAt = null;
                        $completedAt = null;

                        if ($isPast && ($idx % 7) !== 0) {
                            $status = 'completed';
                            $checkedInAt = $date->copy()->setTime($shiftType === 'afternoon' ? 16 : 8, 5);
                            $completedAt = $date->copy()->setTime($shiftType === 'afternoon' ? 23 : 15, 45);
                        } elseif ($isToday && $shiftIndex === 0) {
                            $status = 'checked_in';
                            $checkedInAt = $now->copy()->subHours(1);
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
                            'checked_in_at' => $checkedInAt,
                            'completed_at' => $completedAt,
                            'handover_notes' => 'เฝ้าระวังระบบเครือข่ายและ Wazuh SIEM ประจำกะ',
                            'created_by' => $users->first()->id,
                        ]);
                    }
                }
            }
        }

        $shiftOrder = "CASE shift_type WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 WHEN 'night' THEN 3 WHEN 'daily' THEN 4 ELSE 5 END";
        $todayStr = $now->toDateString();
        $tomorrowStr = $now->copy()->addDay()->toDateString();

        $formatItem = function (SocShiftSchedule $item) use ($now) {
            $isPastDay = $item->shift_date->lt($now->copy()->startOfDay());
            $effectiveStatus = ($isPastDay && $item->status === 'scheduled') ? 'missed' : $item->status;

            return [
                'id' => $item->id,
                'shift_date' => $item->shift_date->toDateString(),
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
                'status_label' => SocShiftSchedule::$statusLabels[$effectiveStatus] ?? $effectiveStatus,
                'soc_topic_id' => $item->soc_topic_id,
                'checked_in_at' => $item->checked_in_at?->format('H:i น.'),
                'completed_at' => $item->completed_at?->format('H:i น.'),
                'handover_notes' => $item->handover_notes,
            ];
        };

        $todayShifts = SocShiftSchedule::with([
            'user:id,name,provider_id,role,agency_code,agency_name,hospcode,hname_th,position,phone',
            'backupUser:id,name,provider_id,agency_name,hname_th,position',
        ])
            ->whereDate('shift_date', $todayStr)
            ->orderByRaw($shiftOrder)
            ->get()
            ->map($formatItem);

        $tomorrowShifts = SocShiftSchedule::with([
            'user:id,name,provider_id,role,agency_code,agency_name,hospcode,hname_th,position,phone',
            'backupUser:id,name,provider_id,agency_name,hname_th,position',
        ])
            ->whereDate('shift_date', $tomorrowStr)
            ->orderByRaw($shiftOrder)
            ->get()
            ->map($formatItem);

        $monthAll = SocShiftSchedule::whereBetween('shift_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])->get();
        $totalMonth = $monthAll->count();
        $completedMonth = $monthAll->where('status', 'completed')->count();
        $checkedInMonth = $monthAll->where('status', 'checked_in')->count();
        $pastOrTodayCount = $monthAll->filter(fn ($s) => $s->shift_date->lte($now->copy()->endOfDay()))->count();
        $overdueMonth = $monthAll->filter(fn ($s) => $s->shift_date->lt($now->copy()->startOfDay()) && $s->status !== 'completed')->count();
        $complianceRate = $pastOrTodayCount > 0 ? round(($completedMonth / $pastOrTodayCount) * 100, 1) : 100.0;

        return [
            'today_date_display' => $now->format('d/m/Y'),
            'tomorrow_date_display' => $now->copy()->addDay()->format('d/m/Y'),
            'today_shifts' => $todayShifts,
            'tomorrow_shifts' => $tomorrowShifts,
            'stats' => [
                'total_month' => $totalMonth,
                'completed_month' => $completedMonth,
                'checked_in_now' => $todayShifts->where('status', 'checked_in')->count() ?: $checkedInMonth,
                'overdue_month' => $overdueMonth,
                'compliance_rate' => $complianceRate,
            ],
        ];
    }

    /**
     * API endpoint for on-demand live refresh of Wazuh and SOC data.
     */
    public function syncLive(): JsonResponse
    {
        $agentsSummary = $this->wazuhService->getAgentsSummary();
        $hospitalsAgents = $this->wazuhService->getHospitalAgentsBreakdown();
        $alertsSummary = $this->wazuhService->getAlertsSummary();
        $connectionStatus = $this->wazuhService->getConnectionStatus();

        return response()->json([
            'success' => true,
            'agentsSummary' => $agentsSummary,
            'hospitalsAgents' => $hospitalsAgents,
            'alertsSummary' => $alertsSummary,
            'connectionStatus' => $connectionStatus,
            'lastUpdated' => Carbon::now()->timezone('Asia/Bangkok')->format('H:i:s'),
        ]);
    }
}
