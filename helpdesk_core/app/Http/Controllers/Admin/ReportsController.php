<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Module;
use App\Models\User;
use App\Services\ReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReportsController extends Controller
{
    protected ReportingService $reportingService;

    public function __construct(ReportingService $reportingService)
    {
        $this->reportingService = $reportingService;
    }

    /**
     * Reports dashboard page.
     */
    public function index(Request $request): InertiaResponse
    {
        return Inertia::render('Admin/Reports/Index', [
            'branches' => Branch::active()->get(['id', 'name']),
            'modules' => Module::active()->get(['id', 'name']),
            'admins' => User::whereIn('role', [User::ROLE_ADMIN, User::ROLE_SUPER_ADMIN])->get(['id', 'name']),
            'filters' => $request->only(['start_date', 'end_date', 'branch_id', 'module_id', 'assigned_admin_id', 'status']),
        ]);
    }

    /**
     * Get summary KPIs.
     */
    public function summary(Request $request): JsonResponse
    {
        $this->reportingService->setFilters($request->all());
        
        return response()->json([
            'data' => $this->reportingService->getSummary(),
        ]);
    }

    /**
     * Get volume trends.
     */
    public function volume(Request $request): JsonResponse
    {
        $granularity = $request->get('granularity', 'day');
        $this->reportingService->setFilters($request->all());
        
        return response()->json([
            'data' => $this->reportingService->getVolumeTrends($granularity),
        ]);
    }

    /**
     * Get breakdown reports.
     */
    public function breakdowns(Request $request): JsonResponse
    {
        $this->reportingService->setFilters($request->all());
        
        return response()->json([
            'data' => $this->reportingService->getBreakdowns(),
        ]);
    }

    /**
     * Get performance metrics.
     */
    public function performance(Request $request): JsonResponse
    {
        $this->reportingService->setFilters($request->all());
        
        return response()->json([
            'data' => $this->reportingService->getPerformance(),
        ]);
    }

    /**
     * Export tickets to CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $this->reportingService->setFilters($request->all());
        $tickets = $this->reportingService->getTicketsForExport();

        $filename = 'tickets_export_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($tickets) {
            $file = fopen('php://output', 'w');

            // Header row
            if ($tickets->isNotEmpty()) {
                fputcsv($file, array_keys($tickets->first()));
            }

            // Data rows
            foreach ($tickets as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export summary report to CSV.
     */
    public function exportSummaryCsv(Request $request): StreamedResponse
    {
        $this->reportingService->setFilters($request->all());
        
        $summary = $this->reportingService->getSummary();
        $breakdowns = $this->reportingService->getBreakdowns();

        $filename = 'summary_report_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($summary, $breakdowns) {
            $file = fopen('php://output', 'w');

            // KPIs section
            fputcsv($file, ['=== KEY PERFORMANCE INDICATORS ===']);
            fputcsv($file, ['Metric', 'Value']);
            fputcsv($file, ['Total Created', $summary['total_created']]);
            fputcsv($file, ['Total Resolved', $summary['total_resolved']]);
            fputcsv($file, ['Total Closed', $summary['total_closed']]);
            fputcsv($file, ['Current Open', $summary['current_open']]);
            fputcsv($file, ['Avg Resolve Time (hours)', $summary['avg_resolve_time_hours']]);
            fputcsv($file, ['Reopen Rate (%)', $summary['reopen_rate_percent']]);
            fputcsv($file, []);

            // By Branch
            fputcsv($file, ['=== TICKETS BY BRANCH ===']);
            fputcsv($file, ['Branch', 'Count']);
            foreach ($breakdowns['by_branch'] as $row) {
                fputcsv($file, [$row['name'], $row['count']]);
            }
            fputcsv($file, []);

            // By Module
            fputcsv($file, ['=== TICKETS BY MODULE ===']);
            fputcsv($file, ['Module', 'Count']);
            foreach ($breakdowns['by_module'] as $row) {
                fputcsv($file, [$row['name'], $row['count']]);
            }
            fputcsv($file, []);

            // By Admin
            fputcsv($file, ['=== TICKETS BY ASSIGNED ADMIN ===']);
            fputcsv($file, ['Admin', 'Count']);
            foreach ($breakdowns['by_admin'] as $row) {
                fputcsv($file, [$row['name'], $row['count']]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
