<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\User;
use App\Models\Branch;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            return $this->superAdminDashboard($user);
        } elseif ($user->isAdmin()) {
            return $this->adminDashboard($user);
        } else {
            return $this->userDashboard($user);
        }
    }

    private function userDashboard($user)
    {
        // Get ticket statistics for the current user
        $openCount = Ticket::where('created_by_user_id', $user->id)
            ->whereIn('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_USER', 'WAITING_VENDOR'])
            ->count();

        $pendingCount = Ticket::where('created_by_user_id', $user->id)
            ->whereIn('status', ['WAITING_USER', 'WAITING_VENDOR'])
            ->count();

        $resolvedCount = Ticket::where('created_by_user_id', $user->id)
            ->whereIn('status', ['RESOLVED', 'CLOSED'])
            ->count();

        // Get recent activity (last 5 tickets)
        $recentTickets = Ticket::where('created_by_user_id', $user->id)
            ->with(['module', 'branch'])
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_no' => $ticket->ticket_no,
                    'title' => $ticket->issue_description,
                    'status' => $ticket->status,
                    'date' => $ticket->updated_at->diffForHumans(),
                    'type' => 'ticket',
                ];
            });

        return Inertia::render('Dashboard/UserDashboard', [
            'stats' => [
                'open' => $openCount,
                'pending' => $pendingCount,
                'resolved' => $resolvedCount,
            ],
            'recentActivity' => $recentTickets,
        ]);
    }

    private function adminDashboard($user)
    {
        $assignedStats = Ticket::where('assigned_admin_id', $user->id)
            ->whereIn('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_USER', 'WAITING_VENDOR'])
            ->count();
            
        $unassignedStats = Ticket::whereNull('assigned_admin_id')
            ->where('status', 'NEW')
            ->count();
            
        // SLA Alerts: Top 5 closest to breaching or breached
        $slaAlerts = Ticket::whereIn('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS'])
            ->whereNotNull('resolution_due_at')
            ->orderBy('resolution_due_at', 'asc')
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_no' => $ticket->ticket_no,
                    'title' => $ticket->issue_description,
                    'status' => $ticket->status,
                    'due_date' => $ticket->resolution_due_at->diffForHumans(),
                    'is_breached' => $ticket->resolution_due_at->isPast(),
                ];
            });

        $recentActivity = Ticket::where('assigned_admin_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_no' => $ticket->ticket_no,
                    'title' => $ticket->issue_description,
                    'status' => $ticket->status,
                    'date' => $ticket->updated_at->diffForHumans(),
                    'type' => 'ticket',
                ];
            });

        return Inertia::render('Dashboard/AdminDashboard', [
            'stats' => [
                'assigned' => $assignedStats,
                'unassigned' => $unassignedStats,
                'sla_alerts_count' => $slaAlerts->where('is_breached', true)->count(),
            ],
            'slaAlerts' => $slaAlerts,
            'recentActivity' => $recentActivity,
        ]);
    }

    private function superAdminDashboard($user)
    {
        $globalStats = [
            'users' => User::count(),
            'branches' => Branch::count(),
            'modules' => Module::count(),
            'open_tickets' => Ticket::whereIn('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS'])->count(),
            'new_tickets' => Ticket::where('status', 'NEW')->count(),
            'assigned_tickets' => Ticket::where('status', 'ASSIGNED')->count(),
            'resolved_tickets' => Ticket::whereIn('status', ['RESOLVED', 'CLOSED'])->count(),
        ];

        // System Health - Disk
        $diskTotal = disk_total_space(base_path());
        $diskFree = disk_free_space(base_path());
        $diskUsed = $diskTotal - $diskFree;
        $diskUsagePercent = $diskTotal > 0 ? round(($diskUsed / $diskTotal) * 100, 2) : 0;

        // Database Size
        $dbSizeQuery = DB::select("SELECT SUM(data_length + index_length) / 1024 / 1024 AS size FROM information_schema.TABLES WHERE table_schema=?", [DB::connection()->getDatabaseName()]);
        $dbSize = $dbSizeQuery[0]->size ? round($dbSizeQuery[0]->size, 2) . ' MB' : 'N/A';

        // CPU and RAM
        $cpuLoad = 'N/A';
        $ramUsage = 'N/A';
        $ramPercent = 0;

        try {
            if (stristr(PHP_OS, 'win')) {
                $wmicRam = shell_exec('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value 2>nul');
                if ($wmicRam) {
                    preg_match('/FreePhysicalMemory=(\d+)/i', $wmicRam, $free);
                    preg_match('/TotalVisibleMemorySize=(\d+)/i', $wmicRam, $total);
                    if (isset($free[1]) && isset($total[1])) {
                        $freeMB = round($free[1] / 1024);
                        $totalMB = round($total[1] / 1024);
                        $usedMB = $totalMB - $freeMB;
                        $ramPercent = $totalMB > 0 ? round(($usedMB / $totalMB) * 100) : 0;
                        $ramUsage = "{$usedMB}MB / {$totalMB}MB";
                    }
                }
                $wmicCpu = shell_exec('wmic cpu get loadpercentage /Value 2>nul');
                if ($wmicCpu) {
                    preg_match('/LoadPercentage=(\d+)/i', $wmicCpu, $cpu);
                    if (isset($cpu[1])) {
                        $cpuLoad = $cpu[1] . '%';
                    }
                }
            } else {
                $meminfo = @file_get_contents('/proc/meminfo');
                if ($meminfo) {
                    preg_match('/MemTotal:\s+(\d+)\s+kB/', $meminfo, $total);
                    preg_match('/MemAvailable:\s+(\d+)\s+kB/', $meminfo, $avail);
                    if (isset($total[1]) && isset($avail[1])) {
                        $totalMB = round($total[1] / 1024);
                        $availMB = round($avail[1] / 1024);
                        $usedMB = $totalMB - $availMB;
                        $ramPercent = $totalMB > 0 ? round(($usedMB / $totalMB) * 100) : 0;
                        $ramUsage = "{$usedMB}MB / {$totalMB}MB";
                    }
                }
                $load = sys_getloadavg();
                if ($load) {
                    $cpuLoad = $load[0] . '%';
                }
            }
        } catch (\Exception $e) { }

        $systemHealth = [
            'laravel_version' => app()->version(),
            'php_version' => phpversion(),
            'environment' => app()->environment(),
            'disk_total' => round($diskTotal / 1024 / 1024 / 1024, 2) . ' GB',
            'disk_free' => round($diskFree / 1024 / 1024 / 1024, 2) . ' GB',
            'disk_usage_percent' => $diskUsagePercent,
            'db_size' => $dbSize,
            'os' => php_uname('s') . ' ' . php_uname('r'),
            'cpu_load' => $cpuLoad,
            'ram_usage' => $ramUsage,
            'ram_percent' => $ramPercent,
        ];

        // Last 5 created users
        $recentUsers = User::orderBy('created_at', 'desc')->take(5)->get()->map(function($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
                'date' => $u->created_at->diffForHumans(),
            ];
        });

        // Global SLA breached tickets list
        $slaBreached = Ticket::whereIn('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS'])
            ->whereNotNull('resolution_due_at')
            ->where('resolution_due_at', '<', now())
            ->orderBy('resolution_due_at', 'asc')
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_no' => $ticket->ticket_no,
                    'title' => $ticket->issue_description,
                    'status' => $ticket->status,
                    'due_date' => $ticket->resolution_due_at->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard/SuperAdminDashboard', [
            'globalStats' => $globalStats,
            'systemHealth' => $systemHealth,
            'recentUsers' => $recentUsers,
            'slaBreached' => $slaBreached,
        ]);
    }
}
