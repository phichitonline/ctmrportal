<?php

namespace App\Http\Controllers;

use App\Models\AgencyTask;
use App\Models\AgencyTaskStep;
use App\Models\StepAttachment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AgencyDocumentController extends Controller
{
    /**
     * Categories list with labels and color badges.
     */
    public static array $categories = [
        ['id' => 'cybersecurity', 'name' => 'ความมั่นคงปลอดภัยไซเบอร์ (Cyber Security)', 'color' => 'sky'],
        ['id' => 'his_system', 'name' => 'ระบบสารสนเทศโรงพยาบาล (HIS/HOSxP)', 'color' => 'indigo'],
        ['id' => 'monthly_report', 'name' => 'รายงานผลประจำเดือน / รายไตรมาส', 'color' => 'emerald'],
        ['id' => 'audit', 'name' => 'ตรวจประเมินมาตรฐาน & ธรรมาภิบาล', 'color' => 'amber'],
        ['id' => 'meeting_report', 'name' => 'รายงานการประชุม', 'color' => 'teal'],
        ['id' => 'general', 'name' => 'ภารกิจทั่วไป / ประสานงานสาธารณสุข', 'color' => 'slate'],
    ];

    /**
     * Display the document repository & task tracking dashboard.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $isAdmin = $user && $user->role === 'admin';

        $query = AgencyTask::query()
            ->with(['user:id,name,provider_id,agency_name', 'assignedUser:id,name,provider_id', 'steps'])
            ->withCount(['steps', 'attachments']);

        // Permissions: If hospital user, default/restrict to their agency unless looking at all public
        $selectedAgency = $request->input('agency_code');
        if (! $isAdmin) {
            $selectedAgency = $user->agency_code;
            $query->where('agency_code', $selectedAgency);
        } elseif ($selectedAgency && $selectedAgency !== 'all') {
            $query->where('agency_code', $selectedAgency);
        }

        // Filter: Category
        if ($cat = $request->input('category')) {
            if ($cat !== 'all') {
                $query->where('category', $cat);
            }
        }

        // Filter: Priority
        if ($priority = $request->input('priority')) {
            if ($priority !== 'all') {
                $query->where('priority', $priority);
            }
        }

        // Filter: Status
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        // Search
        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('agency_name', 'like', "%{$search}%")
                    ->orWhereHas('steps', function ($sq) use ($search) {
                        $sq->where('title', 'like', "%{$search}%");
                    });
            });
        }

        // Sort: pinned first, then latest
        $tasks = $query->orderBy('is_pinned', 'desc')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Calculate KPI Statistics
        $statsBase = AgencyTask::query();
        if (! $isAdmin) {
            $statsBase->where('agency_code', $user->agency_code);
        } elseif ($selectedAgency && $selectedAgency !== 'all') {
            $statsBase->where('agency_code', $selectedAgency);
        }

        $stats = [
            'total_tasks' => (clone $statsBase)->count(),
            'completed' => (clone $statsBase)->where('status', 'completed')->count(),
            'in_progress' => (clone $statsBase)->where('status', 'in_progress')->count(),
            'pending' => (clone $statsBase)->where('status', 'pending')->count(),
            'overdue' => (clone $statsBase)->where('status', '!=', 'completed')
                ->whereNotNull('due_date')
                ->where('due_date', '<', Carbon::today())
                ->count(),
            'total_attachments' => StepAttachment::query()
                ->when(! $isAdmin, fn ($q) => $q->whereHas('task', fn ($tq) => $tq->where('agency_code', $user->agency_code)))
                ->when($isAdmin && $selectedAgency && $selectedAgency !== 'all', fn ($q) => $q->whereHas('task', fn ($tq) => $tq->where('agency_code', $selectedAgency)))
                ->count(),
        ];

        // Document Explorer View Data: Recent attachments with task & step context
        $attachmentsQuery = StepAttachment::query()
            ->with(['user:id,name', 'task:id,title,agency_name,agency_code', 'step:id,title,step_number'])
            ->latest();

        if (! $isAdmin) {
            $attachmentsQuery->whereHas('task', fn ($tq) => $tq->where('agency_code', $user->agency_code));
        } elseif ($selectedAgency && $selectedAgency !== 'all') {
            $attachmentsQuery->whereHas('task', fn ($tq) => $tq->where('agency_code', $selectedAgency));
        }

        if ($fileType = $request->input('file_type')) {
            if ($fileType !== 'all') {
                $attachmentsQuery->where('file_type', $fileType);
            }
        }

        $recentAttachments = $attachmentsQuery->take(20)->get()->map(function ($att) {
            return [
                'id' => $att->id,
                'file_name' => $att->file_name,
                'file_type' => $att->file_type,
                'file_size' => $att->formatted_size,
                'description' => $att->description,
                'download_count' => $att->download_count,
                'created_at' => $att->created_at->diffForHumans(),
                'uploader' => $att->user?->name ?? 'ระบบ',
                'task_title' => $att->task?->title,
                'task_id' => $att->task_id,
                'agency_name' => $att->task?->agency_name,
                'step_number' => $att->step?->step_number,
                'step_title' => $att->step?->title,
            ];
        });

        return Inertia::render('AgencyDocs/Index', [
            'tasks' => $tasks,
            'stats' => $stats,
            'recentAttachments' => $recentAttachments,
            'agencies' => UserController::$agencies,
            'categories' => self::$categories,
            'filters' => [
                'agency_code' => $selectedAgency ?? 'all',
                'category' => $request->input('category', 'all'),
                'priority' => $request->input('priority', 'all'),
                'status' => $request->input('status', 'all'),
                'search' => $request->input('search', ''),
                'file_type' => $request->input('file_type', 'all'),
            ],
        ]);
    }

    /**
     * Store a new agency task and initialize default or custom steps.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'agency_code' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string'],
            'priority' => ['required', 'string', 'in:urgent,high,normal,low'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'steps' => ['nullable', 'array'],
            'steps.*.title' => ['required_with:steps', 'string', 'max:255'],
            'steps.*.due_date' => ['nullable', 'date'],
        ], [
            'title.required' => 'กรุณาระบุชื่องาน / โครงการ',
            'agency_code.required' => 'กรุณาเลือกหน่วยงานผู้รับผิดชอบ',
            'category.required' => 'กรุณาเลือกหมวดหมู่งาน',
        ]);

        $user = Auth::user();

        // Match agency name
        $agencyName = 'สำนักงานสาธารณสุขจังหวัดพิจิตร';
        foreach (UserController::$agencies as $ag) {
            if ($ag['code'] === $validated['agency_code']) {
                $agencyName = $ag['name'];
                break;
            }
        }

        $task = AgencyTask::create([
            'agency_code' => $validated['agency_code'],
            'agency_name' => $agencyName,
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'status' => 'pending',
            'progress_percent' => 0,
            'start_date' => $validated['start_date'] ?? Carbon::today()->toDateString(),
            'due_date' => $validated['due_date'] ?? null,
        ]);

        // Create initial steps: either user-defined or standard 4-phase steps
        if (! empty($validated['steps'])) {
            foreach ($validated['steps'] as $idx => $stepData) {
                $task->steps()->create([
                    'step_number' => $idx + 1,
                    'title' => $stepData['title'],
                    'due_date' => $stepData['due_date'] ?? null,
                    'status' => 'pending',
                ]);
            }
        } else {
            $defaultSteps = [
                ['step_number' => 1, 'title' => 'ขั้นตอนที่ 1: วางแผนและรวบรวมข้อมูลความต้องการ'],
                ['step_number' => 2, 'title' => 'ขั้นตอนที่ 2: ดำเนินการและปฏิบัติตามแผนงาน'],
                ['step_number' => 3, 'title' => 'ขั้นตอนที่ 3: ตรวจสอบและประเมินผลการดำเนินงาน'],
                ['step_number' => 4, 'title' => 'ขั้นตอนที่ 4: สรุปผลและส่งมอบรายงานสมบูรณ์'],
            ];

            foreach ($defaultSteps as $stepData) {
                $task->steps()->create($stepData + ['status' => 'pending']);
            }
        }

        return redirect()->route('agency-docs.show', $task->id)
            ->with('success', "สร้างภารกิจงาน \"{$task->title}\" เรียบร้อยแล้ว");
    }

    /**
     * Display a specific task with its Step Timeline & File Attachments.
     */
    public function show(AgencyTask $task): Response
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $user->agency_code !== $task->agency_code) {
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลของหน่วยงานนี้');
        }

        $task->load([
            'user:id,name,provider_id,agency_name',
            'assignedUser:id,name,provider_id,agency_name',
            'steps' => function ($sq) {
                $sq->orderBy('step_number', 'asc')->with([
                    'completedByUser:id,name',
                    'attachments' => function ($aq) {
                        $aq->latest()->with('user:id,name');
                    },
                ]);
            },
        ]);

        // Transform steps to include formatted dates and file details
        $formattedSteps = $task->steps->map(function ($step) {
            return [
                'id' => $step->id,
                'step_number' => $step->step_number,
                'title' => $step->title,
                'description' => $step->description,
                'status' => $step->status,
                'due_date' => $step->due_date ? $step->due_date->format('d/m/Y') : null,
                'raw_due_date' => $step->due_date ? $step->due_date->toDateString() : null,
                'completed_at' => $step->completed_at ? $step->completed_at->format('d/m/Y H:i น.') : null,
                'completed_by_name' => $step->completedByUser?->name,
                'remarks' => $step->remarks,
                'attachments' => $step->attachments->map(function ($att) {
                    return [
                        'id' => $att->id,
                        'file_name' => $att->file_name,
                        'file_type' => $att->file_type,
                        'file_size' => $att->formatted_size,
                        'description' => $att->description,
                        'download_count' => $att->download_count,
                        'created_at' => $att->created_at->format('d/m/Y H:i น.'),
                        'uploader_name' => $att->user?->name ?? 'ระบบ',
                    ];
                }),
            ];
        });

        return Inertia::render('AgencyDocs/Show', [
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'agency_code' => $task->agency_code,
                'agency_name' => $task->agency_name,
                'category' => $task->category,
                'priority' => $task->priority,
                'status' => $task->status,
                'progress_percent' => $task->progress_percent,
                'start_date' => $task->start_date ? $task->start_date->format('d/m/Y') : null,
                'due_date' => $task->due_date ? $task->due_date->format('d/m/Y') : null,
                'completed_at' => $task->completed_at ? $task->completed_at->format('d/m/Y H:i น.') : null,
                'creator_name' => $task->user?->name,
                'creator_agency' => $task->user?->agency_name,
                'created_at' => $task->created_at->format('d/m/Y H:i น.'),
                'is_pinned' => $task->is_pinned,
            ],
            'steps' => $formattedSteps,
            'categories' => self::$categories,
            'agencies' => UserController::$agencies,
        ]);
    }

    /**
     * Update task metadata.
     */
    public function update(Request $request, AgencyTask $task): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string'],
            'priority' => ['required', 'string', 'in:urgent,high,normal,low'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:pending,in_progress,under_review,completed,cancelled'],
        ]);

        $task->update($validated);
        $task->recalculateProgress();

        return back()->with('success', 'บันทึกการแก้ไขข้อมูลโครงการเรียบร้อยแล้ว');
    }

    /**
     * Delete a task.
     */
    public function destroy(AgencyTask $task): RedirectResponse
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $user->id !== $task->user_id && $user->agency_code !== $task->agency_code) {
            abort(403, 'คุณไม่มีสิทธิ์ลบรายการกิจกรรมนี้');
        }

        // Delete physical files
        foreach ($task->attachments as $att) {
            if (Storage::disk('public')->exists($att->file_path)) {
                Storage::disk('public')->delete($att->file_path);
            }
        }

        $title = $task->title;
        $task->delete();

        return redirect()->route('agency-docs.index')->with('success', "ลบรายการกิจกรรม \"{$title}\" และเอกสารแนบทั้งหมดเรียบร้อยแล้ว");
    }

    /**
     * Add a step to the task.
     */
    public function storeStep(Request $request, AgencyTask $task): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
        ], [
            'title.required' => 'กรุณาระบุชื่อขั้นตอน',
        ]);

        $nextNumber = ($task->steps()->max('step_number') ?? 0) + 1;

        $task->steps()->create([
            'step_number' => $nextNumber,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'status' => 'pending',
        ]);

        $task->recalculateProgress();

        return back()->with('success', 'เพิ่มขั้นตอนการทำงานใหม่เรียบร้อยแล้ว');
    }

    /**
     * Update a step's status or details.
     */
    public function updateStep(Request $request, AgencyTaskStep $step): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,in_progress,completed'],
            'remarks' => ['nullable', 'string'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
        ]);

        $stepData = [];
        if (isset($validated['status'])) {
            $stepData['status'] = $validated['status'];
            if ($validated['status'] === 'completed') {
                $stepData['completed_at'] = now();
                $stepData['completed_by'] = Auth::id();
            } else {
                $stepData['completed_at'] = null;
                $stepData['completed_by'] = null;
            }
        }

        if (isset($validated['remarks'])) {
            $stepData['remarks'] = $validated['remarks'];
        }
        if (! empty($validated['title'])) {
            $stepData['title'] = $validated['title'];
        }
        if (isset($validated['description'])) {
            $stepData['description'] = $validated['description'];
        }
        if (isset($validated['due_date'])) {
            $stepData['due_date'] = $validated['due_date'];
        }

        $step->update($stepData);
        $step->task->recalculateProgress();

        return back()->with('success', "อัปเดตขั้นตอน \"{$step->title}\" เรียบร้อยแล้ว");
    }

    /**
     * Delete a step from the timeline.
     */
    public function destroyStep(AgencyTaskStep $step): RedirectResponse
    {
        $task = $step->task;

        // Delete physical attachment files for this step
        foreach ($step->attachments as $att) {
            if (Storage::disk('public')->exists($att->file_path)) {
                Storage::disk('public')->delete($att->file_path);
            }
        }

        $step->delete();

        // Re-number remaining steps
        $remainingSteps = $task->steps()->orderBy('step_number', 'asc')->get();
        foreach ($remainingSteps as $idx => $s) {
            $s->update(['step_number' => $idx + 1]);
        }

        $task->recalculateProgress();

        return back()->with('success', 'ลบขั้นตอนและคำนวณลำดับขั้นตอนใหม่เรียบร้อยแล้ว');
    }

    /**
     * Upload an attachment to a specific step.
     * Supported formats: PDF, Word (doc, docx), Excel (xls, xlsx), PowerPoint (ppt, pptx).
     */
    public function uploadStepAttachment(Request $request, AgencyTaskStep $step): RedirectResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:25600', // 25 MB
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx',
            ],
            'description' => ['nullable', 'string', 'max:255'],
        ], [
            'file.required' => 'กรุณาเลือกไฟล์เอกสารที่ต้องการอัปโหลด',
            'file.mimes' => 'รองรับเฉพาะไฟล์เอกสาร PDF (.pdf), Word (.doc, .docx), Excel (.xls, .xlsx) หรือ PowerPoint (.ppt, .pptx) เท่านั้น',
            'file.max' => 'ขนาดไฟล์ต้องไม่เกิน 25 MB',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getClientMimeType();
        $fileSize = $file->getSize();

        // Categorize file type
        $fileType = StepAttachment::detectFileType($extension, $mimeType);

        // Store file in dedicated agency directory
        $agencyCode = $step->task->agency_code;
        $path = $file->store("agency_docs/{$agencyCode}/step_{$step->id}", 'public');

        StepAttachment::create([
            'step_id' => $step->id,
            'task_id' => $step->task_id,
            'user_id' => Auth::id(),
            'file_name' => $originalName,
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'description' => $request->input('description'),
            'download_count' => 0,
        ]);

        // If step was pending, automatically advance it to in_progress
        if ($step->status === 'pending') {
            $step->update(['status' => 'in_progress']);
            $step->task->recalculateProgress();
        }

        return back()->with('success', "แนบไฟล์รายงานผล \"{$originalName}\" ใน {$step->title} เรียบร้อยแล้ว");
    }

    /**
     * Download a step attachment.
     */
    public function downloadAttachment(StepAttachment $attachment): StreamedResponse
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $user->agency_code !== $attachment->task->agency_code) {
            abort(403, 'คุณไม่มีสิทธิ์ดาวน์โหลดเอกสารของหน่วยงานนี้');
        }

        if (! Storage::disk('public')->exists($attachment->file_path)) {
            abort(404, 'ไม่พบไฟล์เอกสารในระบบจัดเก็บ');
        }

        $attachment->increment('download_count');

        return Storage::disk('public')->download($attachment->file_path, $attachment->file_name);
    }

    /**
     * Delete an attachment.
     */
    public function destroyAttachment(StepAttachment $attachment): RedirectResponse
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $user->id !== $attachment->user_id) {
            abort(403, 'คุณไม่มีสิทธิ์ลบเอกสารแนบนี้');
        }

        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $fileName = $attachment->file_name;
        $attachment->delete();

        return back()->with('success', "ลบไฟล์เอกสาร \"{$fileName}\" เรียบร้อยแล้ว");
    }
}
