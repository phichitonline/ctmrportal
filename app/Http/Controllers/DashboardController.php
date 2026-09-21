<?php

namespace App\Http\Controllers;

use App\Models\AgencyTask;
use App\Models\SocTopic;
use App\Models\StepAttachment;
use App\Services\WazuhApiService;
use Carbon\Carbon;
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

        return Inertia::render('Dashboard', [
            'agentsSummary' => $agentsSummary,
            'hospitalsAgents' => $hospitalsAgents,
            'alertsSummary' => $alertsSummary,
            'connectionStatus' => $connectionStatus,
            'socWebboardSummary' => $socWebboardSummary,
            'agencyDocsSummary' => $agencyDocsSummary,
            'lastUpdated' => Carbon::now()->timezone('Asia/Bangkok')->format('H:i:s'),
        ]);
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
