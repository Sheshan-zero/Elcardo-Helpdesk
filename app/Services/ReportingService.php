<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\TicketComment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    protected ?Carbon $startDate = null;
    protected ?Carbon $endDate = null;
    protected ?int $branchId = null;
    protected ?int $moduleId = null;
    protected ?int $assignedAdminId = null;
    protected ?string $status = null;

    public function setFilters(array $filters): self
    {
        $this->startDate = isset($filters['start_date']) && $filters['start_date'] 
            ? Carbon::parse($filters['start_date'])->startOfDay() 
            : null;
        $this->endDate = isset($filters['end_date']) && $filters['end_date']
            ? Carbon::parse($filters['end_date'])->endOfDay() 
            : null;
        $this->branchId = !empty($filters['branch_id']) ? (int)$filters['branch_id'] : null;
        $this->moduleId = !empty($filters['module_id']) ? (int)$filters['module_id'] : null;
        $this->assignedAdminId = !empty($filters['assigned_admin_id']) ? (int)$filters['assigned_admin_id'] : null;
        $this->status = !empty($filters['status']) ? $filters['status'] : null;

        return $this;
    }

    /**
     * Get summary KPIs
     */
    public function getSummary(): array
    {
        // Total created in date range
        $createdQuery = Ticket::query();
        $this->applyBaseFilters($createdQuery);
        if ($this->startDate && $this->endDate) {
            $createdQuery->whereBetween('created_at', [$this->startDate, $this->endDate]);
        }
        $totalCreated = $createdQuery->count();

        // Total resolved in date range
        $resolvedQuery = Ticket::query();
        $this->applyBaseFilters($resolvedQuery);
        if ($this->startDate && $this->endDate) {
            $resolvedQuery->whereBetween('resolved_at', [$this->startDate, $this->endDate]);
        }
        $totalResolved = $resolvedQuery->whereNotNull('resolved_at')->count();

        // Total closed in date range
        $closedQuery = Ticket::query();
        $this->applyBaseFilters($closedQuery);
        if ($this->startDate && $this->endDate) {
            $closedQuery->whereBetween('closed_at', [$this->startDate, $this->endDate]);
        }
        $totalClosed = $closedQuery->whereNotNull('closed_at')->count();

        // Current open (not CLOSED)
        $openQuery = Ticket::query();
        $this->applyBaseFilters($openQuery, false);
        $currentOpen = $openQuery->where('status', '!=', 'CLOSED')->count();

        // Average time to resolve (hours)
        $avgResolveTime = $this->getAverageResolveTime();

        // Reopen rate
        $reopenRate = $this->getReopenRate();

        return [
            'total_created' => $totalCreated,
            'total_resolved' => $totalResolved,
            'total_closed' => $totalClosed,
            'current_open' => $currentOpen,
            'avg_resolve_time_hours' => round($avgResolveTime, 1),
            'reopen_rate_percent' => round($reopenRate * 100, 1),
        ];
    }

    /**
     * Get volume trends (tickets over time)
     */
    public function getVolumeTrends(string $granularity = 'day'): array
    {
        $dateFormat = match ($granularity) {
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        // Created over time
        $createdQuery = Ticket::query();
        $this->applyBaseFilters($createdQuery);
        if ($this->startDate && $this->endDate) {
            $createdQuery->whereBetween('created_at', [$this->startDate, $this->endDate]);
        }

        $createdTrend = $createdQuery
            ->selectRaw("DATE_FORMAT(created_at, ?) as period, COUNT(*) as count", [$dateFormat])
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('count', 'period')
            ->toArray();

        // Resolved over time
        $resolvedQuery = Ticket::query();
        $this->applyBaseFilters($resolvedQuery);
        if ($this->startDate && $this->endDate) {
            $resolvedQuery->whereBetween('resolved_at', [$this->startDate, $this->endDate]);
        }

        $resolvedTrend = $resolvedQuery
            ->whereNotNull('resolved_at')
            ->selectRaw("DATE_FORMAT(resolved_at, ?) as period, COUNT(*) as count", [$dateFormat])
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('count', 'period')
            ->toArray();

        // Merge into chart-friendly format
        $allPeriods = array_unique(array_merge(array_keys($createdTrend), array_keys($resolvedTrend)));
        sort($allPeriods);

        $chartData = [];
        foreach ($allPeriods as $period) {
            $chartData[] = [
                'period' => $period,
                'created' => $createdTrend[$period] ?? 0,
                'resolved' => $resolvedTrend[$period] ?? 0,
            ];
        }

        return $chartData;
    }

    /**
     * Get breakdown by various dimensions
     */
    public function getBreakdowns(): array
    {
        // By Branch
        $byBranchQuery = Ticket::query()
            ->join('branches', 'tickets.branch_id', '=', 'branches.id');
        $this->applyBaseFilters($byBranchQuery);
        if ($this->startDate && $this->endDate) {
            $byBranchQuery->whereBetween('tickets.created_at', [$this->startDate, $this->endDate]);
        }
        $byBranch = $byBranchQuery
            ->selectRaw('branches.name as name, COUNT(*) as count')
            ->groupBy('branches.id', 'branches.name')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        // By Module
        $byModuleQuery = Ticket::query()
            ->join('modules', 'tickets.module_id', '=', 'modules.id');
        $this->applyBaseFilters($byModuleQuery);
        if ($this->startDate && $this->endDate) {
            $byModuleQuery->whereBetween('tickets.created_at', [$this->startDate, $this->endDate]);
        }
        $byModule = $byModuleQuery
            ->selectRaw('modules.name as name, COUNT(*) as count')
            ->groupBy('modules.id', 'modules.name')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        // By Status (current snapshot - no date filter)
        $byStatus = Ticket::query()
            ->selectRaw('status as name, COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        // By Assigned Admin
        $byAdminQuery = Ticket::query()
            ->leftJoin('users', 'tickets.assigned_admin_id', '=', 'users.id');
        $this->applyBaseFilters($byAdminQuery);
        if ($this->startDate && $this->endDate) {
            $byAdminQuery->whereBetween('tickets.created_at', [$this->startDate, $this->endDate]);
        }
        $byAdmin = $byAdminQuery
            ->selectRaw("COALESCE(users.name, 'Unassigned') as name, COUNT(*) as count")
            ->groupBy('tickets.assigned_admin_id', 'users.name')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        return [
            'by_branch' => $byBranch,
            'by_module' => $byModule,
            'by_status' => $byStatus,
            'by_admin' => $byAdmin,
        ];
    }

    /**
     * Get performance metrics
     */
    public function getPerformance(): array
    {
        // Average first response time (simplified - just return 0 if no data)
        $avgFirstResponse = 0;
        
        try {
            $avgFirstResponse = $this->getAverageFirstResponseTime();
        } catch (\Exception $e) {
            // Fallback to 0 on error
        }

        // Average resolve time
        $avgResolveTime = $this->getAverageResolveTime();

        // Longest open tickets (top 20)
        $longestOpen = Ticket::with(['branch:id,name', 'module:id,name', 'assignedAdmin:id,name'])
            ->where('status', '!=', 'CLOSED')
            ->orderBy('created_at', 'asc')
            ->limit(20)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_no' => $ticket->ticket_no,
                    'branch' => $ticket->branch?->name ?? 'N/A',
                    'module' => $ticket->module?->name ?? 'N/A',
                    'status' => $ticket->status,
                    'assigned_admin' => $ticket->assignedAdmin?->name ?? 'Unassigned',
                    'age_hours' => round(now()->diffInHours($ticket->created_at), 1),
                    'age_days' => round(now()->diffInDays($ticket->created_at), 1),
                    'created_at' => $ticket->created_at->toIso8601String(),
                ];
            })
            ->toArray();

        // Tickets stuck in waiting statuses
        $stuckTickets = Ticket::with(['branch:id,name', 'module:id,name'])
            ->whereIn('status', ['WAITING_USER', 'WAITING_VENDOR'])
            ->where('updated_at', '<', now()->subDays(3))
            ->orderBy('updated_at', 'asc')
            ->limit(20)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_no' => $ticket->ticket_no,
                    'branch' => $ticket->branch?->name ?? 'N/A',
                    'module' => $ticket->module?->name ?? 'N/A',
                    'status' => $ticket->status,
                    'days_stuck' => round(now()->diffInDays($ticket->updated_at), 1),
                ];
            })
            ->toArray();

        return [
            'avg_first_response_hours' => round($avgFirstResponse, 1),
            'avg_resolve_time_hours' => round($avgResolveTime, 1),
            'longest_open' => $longestOpen,
            'stuck_tickets' => $stuckTickets,
        ];
    }

    /**
     * Get tickets for export
     */
    public function getTicketsForExport(): \Illuminate\Support\Collection
    {
        $query = Ticket::query();
        $this->applyBaseFilters($query);
        
        if ($this->startDate && $this->endDate) {
            $query->whereBetween('created_at', [$this->startDate, $this->endDate]);
        }

        return $query
            ->with(['branch:id,name', 'module:id,name', 'assignedAdmin:id,name', 'creator:id,name'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ticket) {
                return [
                    'Ticket No' => $ticket->ticket_no,
                    'Status' => $ticket->status,
                    'Branch' => $ticket->branch?->name ?? 'N/A',
                    'Module' => $ticket->module?->name ?? 'N/A',
                    'Priority' => $ticket->priority ?? 'NORMAL',
                    'Created By' => $ticket->creator?->name ?? 'N/A',
                    'Assigned Admin' => $ticket->assignedAdmin?->name ?? 'Unassigned',
                    'Created At' => $ticket->created_at->format('Y-m-d H:i:s'),
                    'Resolved At' => $ticket->resolved_at?->format('Y-m-d H:i:s') ?? '',
                    'Closed At' => $ticket->closed_at?->format('Y-m-d H:i:s') ?? '',
                ];
            });
    }

    // ========== Private Helpers ==========

    protected function applyBaseFilters($query, bool $applyStatusFilter = true): void
    {
        if ($this->branchId) {
            $query->where('tickets.branch_id', $this->branchId);
        }

        if ($this->moduleId) {
            $query->where('tickets.module_id', $this->moduleId);
        }

        if ($this->assignedAdminId) {
            $query->where('tickets.assigned_admin_id', $this->assignedAdminId);
        }

        if ($applyStatusFilter && $this->status) {
            $query->where('tickets.status', $this->status);
        }
    }

    protected function getAverageResolveTime(): float
    {
        $query = Ticket::query();
        $this->applyBaseFilters($query);
        
        if ($this->startDate && $this->endDate) {
            $query->whereBetween('resolved_at', [$this->startDate, $this->endDate]);
        }

        $avgSeconds = $query
            ->whereNotNull('resolved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, created_at, resolved_at)) as avg_seconds')
            ->value('avg_seconds');

        return $avgSeconds ? ($avgSeconds / 3600) : 0; // Convert to hours
    }

    protected function getAverageFirstResponseTime(): float
    {
        $adminIds = User::whereIn('role', ['admin', 'super_admin'])->pluck('id');
        
        if ($adminIds->isEmpty()) {
            return 0;
        }

        $query = Ticket::query();
        $this->applyBaseFilters($query);
        if ($this->startDate && $this->endDate) {
            $query->whereBetween('created_at', [$this->startDate, $this->endDate]);
        }

        $ticketIds = $query->pluck('id');

        if ($ticketIds->isEmpty()) {
            return 0;
        }

        // Get first admin comment for each ticket
        $firstComments = TicketComment::whereIn('ticket_id', $ticketIds)
            ->whereIn('user_id', $adminIds)
            ->selectRaw('ticket_id, MIN(created_at) as first_action')
            ->groupBy('ticket_id')
            ->pluck('first_action', 'ticket_id');

        // Get ticket creation times
        $ticketCreated = Ticket::whereIn('id', $ticketIds)
            ->pluck('created_at', 'id');

        // Calculate average first response
        $totalSeconds = 0;
        $count = 0;

        foreach ($ticketIds as $ticketId) {
            $commentTime = $firstComments[$ticketId] ?? null;
            
            if ($commentTime && isset($ticketCreated[$ticketId])) {
                $created = Carbon::parse($ticketCreated[$ticketId]);
                $firstAction = Carbon::parse($commentTime);
                $totalSeconds += $firstAction->diffInSeconds($created);
                $count++;
            }
        }

        return $count > 0 ? ($totalSeconds / $count / 3600) : 0; // Convert to hours
    }

    protected function getReopenRate(): float
    {
        $query = Ticket::query();
        $this->applyBaseFilters($query);
        if ($this->startDate && $this->endDate) {
            $query->whereBetween('resolved_at', [$this->startDate, $this->endDate]);
        }

        $resolvedTicketIds = $query->whereNotNull('resolved_at')->pluck('id');

        if ($resolvedTicketIds->isEmpty()) {
            return 0;
        }

        // Count reopened tickets (status changed from RESOLVED to IN_PROGRESS)
        $reopenedCount = TicketStatusHistory::whereIn('ticket_id', $resolvedTicketIds)
            ->where('from_status', 'RESOLVED')
            ->where('to_status', 'IN_PROGRESS')
            ->distinct('ticket_id')
            ->count('ticket_id');

        return $reopenedCount / $resolvedTicketIds->count();
    }
}
