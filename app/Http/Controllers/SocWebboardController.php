<?php

namespace App\Http\Controllers;

use App\Models\SocComment;
use App\Models\SocTopic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SocWebboardController extends Controller
{
    /**
     * Display a listing of webboard topics and SOC reports.
     */
    public function index(Request $request): Response
    {
        $query = SocTopic::query()->with(['user:id,name,role,agency_name,agency_code', 'resolvedByUser:id,name'])
            ->withCount('comments');

        // Search text
        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('system_affected', 'like', "%{$search}%")
                    ->orWhere('agency_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter: Category
        if ($category = $request->input('category')) {
            if ($category !== 'all') {
                $query->where('category', $category);
            }
        }

        // Filter: Severity
        if ($severity = $request->input('severity')) {
            if ($severity !== 'all') {
                $query->where('severity', $severity);
            }
        }

        // Filter: Status
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        // Filter: Agency Code
        if ($agencyCode = $request->input('agency_code')) {
            if ($agencyCode !== 'all') {
                $query->where('agency_code', $agencyCode);
            }
        }

        // Filter: Shift
        if ($shift = $request->input('shift')) {
            if ($shift !== 'all') {
                $query->where('shift', $shift);
            }
        }

        // Sorting: Pinned first, then latest
        $topics = $query->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        // Calculate KPI Stats
        $today = Carbon::today()->toDateString();
        $stats = [
            'total_topics' => SocTopic::count(),
            'open_issues' => SocTopic::whereIn('status', ['open', 'in_progress'])->count(),
            'today_soc_reports' => SocTopic::where('category', 'soc_report')
                ->where(function ($q) use ($today) {
                    $q->whereDate('shift_date', $today)
                      ->orWhereDate('created_at', $today);
                })->count(),
            'critical_alerts' => SocTopic::whereIn('severity', ['high', 'critical'])
                ->whereIn('status', ['open', 'in_progress'])
                ->count(),
            'resolved_issues' => SocTopic::where('status', 'resolved')->count(),
        ];

        return Inertia::render('Webboard/Index', [
            'topics' => $topics,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
                'severity' => $request->input('severity', 'all'),
                'status' => $request->input('status', 'all'),
                'agency_code' => $request->input('agency_code', 'all'),
                'shift' => $request->input('shift', 'all'),
            ],
            'stats' => $stats,
            'agencies' => UserController::$agencies,
            'categoryLabels' => SocTopic::$categoryLabels,
            'severityLabels' => SocTopic::$severityLabels,
            'statusLabels' => SocTopic::$statusLabels,
            'shiftLabels' => SocTopic::$shiftLabels,
        ]);
    }

    /**
     * Store a newly created topic or SOC report.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:soc_report,discussion,incident_alert,troubleshoot,announcement'],
            'severity' => ['required', 'string', 'in:info,normal,low,medium,high,critical'],
            'agency_code' => ['nullable', 'string', 'max:50'],
            'agency_name' => ['nullable', 'string', 'max:255'],
            'shift' => ['nullable', 'string', 'in:morning,afternoon,night,daily'],
            'shift_date' => ['nullable', 'date'],
            'system_affected' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string', 'min:5'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ], [
            'title.required' => 'กรุณาระบุหัวข้อกระทู้ / ชื่อรายงาน',
            'category.required' => 'กรุณาเลือกหมวดหมู่',
            'severity.required' => 'กรุณาระบุระดับความสำคัญ',
            'content.required' => 'กรุณาระบุเนื้อหาหรือรายละเอียดการปฏิบัติงาน',
            'content.min' => 'เนื้อหาต้องมีความยาวอย่างน้อย 5 ตัวอักษร',
            'image.image' => 'ไฟล์แนบต้องเป็นรูปภาพเท่านั้น',
            'image.max' => 'ขนาดรูปภาพต้องไม่เกิน 5 MB',
            'images.*.image' => 'ไฟล์แนบต้องเป็นรูปภาพเท่านั้น',
            'images.*.max' => 'ขนาดรูปภาพแต่ละไฟล์ต้องไม่เกิน 5 MB',
        ]);

        $user = Auth::user();

        // Match agency name if code is provided
        if (!empty($validated['agency_code']) && empty($validated['agency_name'])) {
            foreach (UserController::$agencies as $ag) {
                if ($ag['code'] === $validated['agency_code']) {
                    $validated['agency_name'] = $ag['name'];
                    break;
                }
            }
        }

        // Default to user's agency if still empty
        if (empty($validated['agency_name']) && $user) {
            $validated['agency_code'] = $user->agency_code;
            $validated['agency_name'] = $user->agency_name;
        }

        // Default shift date to today for SOC report
        if ($validated['category'] === 'soc_report' && empty($validated['shift_date'])) {
            $validated['shift_date'] = Carbon::today()->toDateString();
        }

        // Handle uploaded images
        $uploadedPaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imgFile) {
                if ($imgFile && $imgFile->isValid()) {
                    $path = $imgFile->store('soc_reports', 'public');
                    $uploadedPaths[] = '/storage/' . $path;
                }
            }
        } elseif ($request->hasFile('image')) {
            $singleImg = $request->file('image');
            if ($singleImg && $singleImg->isValid()) {
                $path = $singleImg->store('soc_reports', 'public');
                $uploadedPaths[] = '/storage/' . $path;
            }
        }

        if (!empty($uploadedPaths)) {
            $validated['image_path'] = $uploadedPaths[0];
            $validated['images'] = $uploadedPaths;
        }

        $validated['user_id'] = $user->id;
        $validated['status'] = 'open';

        $topic = SocTopic::create($validated);

        return redirect()->route('webboard.show', $topic->id)->with('success', 'บันทึกกระทู้ / รายงานการปฏิบัติงานเรียบร้อยแล้ว');
    }

    /**
     * Display the specified topic and its comments.
     */
    public function show(SocTopic $topic): Response
    {
        // Increment view count
        $topic->increment('views_count');

        $topic->load([
            'user:id,name,role,agency_name,agency_code,position',
            'resolvedByUser:id,name,agency_name',
            'comments' => function ($q) {
                $q->with('user:id,name,role,agency_name,position')->orderBy('created_at', 'asc');
            },
        ]);

        return Inertia::render('Webboard/Show', [
            'topic' => $topic,
            'agencies' => UserController::$agencies,
            'categoryLabels' => SocTopic::$categoryLabels,
            'severityLabels' => SocTopic::$severityLabels,
            'statusLabels' => SocTopic::$statusLabels,
            'shiftLabels' => SocTopic::$shiftLabels,
        ]);
    }

    /**
     * Update the specified topic.
     */
    public function update(Request $request, SocTopic $topic): RedirectResponse
    {
        $user = Auth::user();

        // Check permission
        if ($user->id !== $topic->user_id && !$user->isAdmin()) {
            return back()->with('error', 'คุณไม่มีสิทธิ์แก้ไขกระทู้นี้');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:soc_report,discussion,incident_alert,troubleshoot,announcement'],
            'severity' => ['required', 'string', 'in:info,normal,low,medium,high,critical'],
            'agency_code' => ['nullable', 'string', 'max:50'],
            'agency_name' => ['nullable', 'string', 'max:255'],
            'shift' => ['nullable', 'string', 'in:morning,afternoon,night,daily'],
            'shift_date' => ['nullable', 'date'],
            'system_affected' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string', 'min:5'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ]);

        if (!empty($validated['agency_code']) && empty($validated['agency_name'])) {
            foreach (UserController::$agencies as $ag) {
                if ($ag['code'] === $validated['agency_code']) {
                    $validated['agency_name'] = $ag['name'];
                    break;
                }
            }
        }

        // Handle uploaded images in update
        if ($request->hasFile('images')) {
            $existing = $topic->images ?? [];
            foreach ($request->file('images') as $imgFile) {
                if ($imgFile && $imgFile->isValid()) {
                    $path = $imgFile->store('soc_reports', 'public');
                    $existing[] = '/storage/' . $path;
                }
            }
            $validated['images'] = $existing;
            $validated['image_path'] = $existing[0] ?? null;
        } elseif ($request->hasFile('image')) {
            $singleImg = $request->file('image');
            if ($singleImg && $singleImg->isValid()) {
                $path = $singleImg->store('soc_reports', 'public');
                $validated['image_path'] = '/storage/' . $path;
                $validated['images'] = [$validated['image_path']];
            }
        }

        $topic->update($validated);

        return back()->with('success', 'แก้ไขข้อมูลกระทู้เรียบร้อยแล้ว');
    }

    /**
     * Remove the specified topic.
     */
    public function destroy(SocTopic $topic): RedirectResponse
    {
        $user = Auth::user();

        // Check permission
        if ($user->id !== $topic->user_id && !$user->isAdmin()) {
            return back()->with('error', 'คุณไม่มีสิทธิ์ลบกระทู้นี้');
        }

        $topic->delete();

        return redirect()->route('webboard.index')->with('success', 'ลบกระทู้เรียบร้อยแล้ว');
    }

    /**
     * Update status and resolution notes.
     */
    public function updateStatus(Request $request, SocTopic $topic): RedirectResponse
    {
        $user = Auth::user();

        // Allow author or admin
        if ($user->id !== $topic->user_id && !$user->isAdmin()) {
            return back()->with('error', 'คุณไม่มีสิทธิ์เปลี่ยนสถานะกระทู้นี้');
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:open,in_progress,resolved,closed'],
            'resolution_notes' => ['nullable', 'string'],
        ]);

        $updateData = ['status' => $validated['status']];

        if ($validated['status'] === 'resolved') {
            $updateData['resolved_by'] = $user->id;
            $updateData['resolved_at'] = now();
            if (!empty($validated['resolution_notes'])) {
                $updateData['resolution_notes'] = $validated['resolution_notes'];
            }
        } elseif ($validated['status'] === 'open' || $validated['status'] === 'in_progress') {
            // Keep resolution notes as history or leave as is
        }

        if (isset($validated['resolution_notes']) && $validated['resolution_notes'] !== null) {
            $updateData['resolution_notes'] = $validated['resolution_notes'];
        }

        $topic->update($updateData);

        return back()->with('success', 'อัปเดตสถานะประเด็นเรียบร้อยแล้ว');
    }

    /**
     * Toggle pinned status (Admin only).
     */
    public function togglePin(SocTopic $topic): RedirectResponse
    {
        $user = Auth::user();

        if (!$user->isAdmin()) {
            return back()->with('error', 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถปักหมุดกระทู้ได้');
        }

        $topic->update(['is_pinned' => !$topic->is_pinned]);

        $statusText = $topic->is_pinned ? 'ปักหมุดกระทู้สำคัญแล้ว' : 'ยกเลิกการปักหมุดแล้ว';
        return back()->with('success', $statusText);
    }

    /**
     * Store a comment for the topic.
     */
    public function storeComment(Request $request, SocTopic $topic): RedirectResponse
    {
        if ($topic->is_locked) {
            return back()->with('error', 'กระทู้นี้ถูกปิดการแสดงความคิดเห็นแล้ว');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:2'],
        ], [
            'content.required' => 'กรุณากรอกข้อความตอบกลับ',
            'content.min' => 'ข้อความต้องมีความยาวอย่างน้อย 2 ตัวอักษร',
        ]);

        SocComment::create([
            'topic_id' => $topic->id,
            'user_id' => Auth::id(),
            'content' => $validated['content'],
            'is_solution' => false,
        ]);

        // Auto move status from open to in_progress if still open
        if ($topic->status === 'open' && $topic->category !== 'announcement') {
            $topic->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'ส่งความคิดเห็นเรียบร้อยแล้ว');
    }

    /**
     * Delete a comment.
     */
    public function destroyComment(SocComment $comment): RedirectResponse
    {
        $user = Auth::user();

        if ($user->id !== $comment->user_id && !$user->isAdmin()) {
            return back()->with('error', 'คุณไม่มีสิทธิ์ลบความคิดเห็นนี้');
        }

        $comment->delete();

        return back()->with('success', 'ลบความคิดเห็นเรียบร้อยแล้ว');
    }

    /**
     * Toggle whether a comment is marked as the solution.
     */
    public function toggleSolution(SocComment $comment): RedirectResponse
    {
        $user = Auth::user();
        $topic = $comment->topic;

        // Author of topic or Admin can mark solution
        if ($user->id !== $topic->user_id && !$user->isAdmin()) {
            return back()->with('error', 'เฉพาะผู้ตั้งกระทู้หรือผู้ดูแลระบบที่สามารถเลือกแนวทางแก้ไขปัญหาได้');
        }

        $newSolutionStatus = !$comment->is_solution;

        if ($newSolutionStatus) {
            // Unset previous solution on this topic
            SocComment::where('topic_id', $topic->id)->update(['is_solution' => false]);
            $comment->update(['is_solution' => true]);

            // Auto-mark topic as resolved if not already
            if ($topic->status !== 'resolved') {
                $topic->update([
                    'status' => 'resolved',
                    'resolved_by' => $user->id,
                    'resolved_at' => now(),
                    'resolution_notes' => 'แก้ไขปัญหาตามแนวทางของ ' . $comment->user->name . ":\n" . substr($comment->content, 0, 200),
                ]);
            }
            $msg = 'บันทึกความคิดเห็นนี้เป็นแนวทางแก้ไขปัญหา (Solution) และปรับสถานะกระทู้เป็นแก้ไขเรียบร้อยแล้ว';
        } else {
            $comment->update(['is_solution' => false]);
            $msg = 'ยกเลิกการเลือกเป็นแนวทางแก้ไขปัญหา';
        }

        return back()->with('success', $msg);
    }
}
