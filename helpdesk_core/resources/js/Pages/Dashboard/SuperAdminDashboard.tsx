import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import GlassCard from '@/Components/GlassCard';

interface SuperAdminDashboardProps extends PageProps {
    globalStats: {
        users: number;
        branches: number;
        modules: number;
        open_tickets: number;
        new_tickets: number;
        assigned_tickets: number;
        resolved_tickets: number;
    };
    systemHealth: {
        laravel_version: string;
        php_version: string;
        environment: string;
        disk_total: string;
        disk_free: string;
        disk_usage_percent: number;
        db_size: string;
        os: string;
        cpu_load: string;
        ram_usage: string;
        ram_percent: number;
    };
    recentUsers: Array<{
        id: number;
        name: string;
        role: string;
        date: string;
    }>;
    slaBreached: Array<{
        id: number;
        ticket_no: string;
        title: string;
        status: string;
        due_date: string;
    }>;
}

export default function SuperAdminDashboard({ auth, globalStats, systemHealth, recentUsers, slaBreached }: SuperAdminDashboardProps) {
    const statsConfig = [
        { label: 'Total Users', value: globalStats.users.toString(), icon: 'users', color: 'blue' },
        { label: 'Total Branches', value: globalStats.branches.toString(), icon: 'office', color: 'purple' },
        { label: 'Total Modules', value: globalStats.modules.toString(), icon: 'cube', color: 'pink' },
        { label: 'Active Tickets', value: globalStats.open_tickets.toString(), icon: 'ticket', color: 'yellow' },
        { label: 'New Tickets', value: globalStats.new_tickets.toString(), icon: 'inbox', color: 'indigo' },
        { label: 'Assigned Tickets', value: globalStats.assigned_tickets.toString(), icon: 'user', color: 'teal' },
        { label: 'Resolved Tickets', value: globalStats.resolved_tickets.toString(), icon: 'check', color: 'green' },
    ];

    const getStatusColor = (status: string) => {
        const statusUpper = status.toUpperCase();
        if (statusUpper === 'RESOLVED' || statusUpper === 'CLOSED') return 'green';
        if (statusUpper === 'IN_PROGRESS') return 'blue';
        if (statusUpper === 'WAITING_USER' || statusUpper === 'WAITING_VENDOR') return 'yellow';
        return 'purple';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Super Admin Dashboard"
        >
            <Head title="Super Admin Dashboard" />

            {/* Welcome Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 tracking-tight">
                            System <span className="gradient-text">Overview</span>
                        </h1>
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">Super Admin global visibility and system health.</p>
                    </div>

                    <div className="flex gap-4">
                        <Link href={route('superadmin.users.index')} className="btn-secondary flex items-center gap-2">
                            Manage Users
                        </Link>
                        <Link href={route('admin.tickets.index')} className="btn-primary flex items-center gap-2 shadow-glow">
                            All Tickets
                        </Link>
                    </div>
                </div>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {statsConfig.map((stat, index) => (
                    <GlassCard key={index} padding="sm" className="relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            {/* Simple icons based on type */}
                            <svg className={`w-16 h-16 text-${stat.color}-400`} fill="currentColor" viewBox="0 0 20 20">
                                {stat.icon === 'users' && <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />}
                                {stat.icon === 'user' && <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />}
                                {stat.icon === 'office' && <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />}
                                {stat.icon === 'cube' && <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />}
                                {stat.icon === 'ticket' && <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />}
                                {stat.icon === 'inbox' && <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd" />}
                                {stat.icon === 'check' && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />}
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs font-semibold uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Hosted System Health */}
                <div className="lg:col-span-2">
                    <GlassCard>
                        <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-700/50 pb-4">
                            <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                            Hosted System Health
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Disk Usage</p>
                                    <div className="flex justify-between text-xs text-white mb-2">
                                        <span>{systemHealth.disk_usage_percent}% Used</span>
                                        <span>{systemHealth.disk_free} Free / {systemHealth.disk_total}</span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                                        <div 
                                            className={`h-2.5 rounded-full ${systemHealth.disk_usage_percent > 85 ? 'bg-red-500' : systemHealth.disk_usage_percent > 65 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                            style={{ width: `${systemHealth.disk_usage_percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">RAM Usage</p>
                                    <div className="flex justify-between text-xs text-white mb-2">
                                        <span>{systemHealth.ram_percent}% Used</span>
                                        <span>{systemHealth.ram_usage}</span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                                        <div 
                                            className={`h-2.5 rounded-full ${systemHealth.ram_percent > 85 ? 'bg-red-500' : systemHealth.ram_percent > 65 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                            style={{ width: `${systemHealth.ram_percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                                        <p className="text-xs text-gray-400 mb-1">CPU Load</p>
                                        <p className="text-lg font-bold text-white uppercase">{systemHealth.cpu_load}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                                        <p className="text-xs text-gray-400 mb-1">DB Size</p>
                                        <p className="text-lg font-bold text-white">{systemHealth.db_size}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 col-span-2 lg:col-span-1">
                                        <p className="text-xs text-gray-400 mb-1">Environment</p>
                                        <p className="text-lg font-bold text-white capitalize">{systemHealth.environment}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
                                    <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">Framework versions</p>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-300">Laravel Version</span>
                                        <span className="text-white font-mono">{systemHealth.laravel_version}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">PHP Version</span>
                                        <span className="text-white font-mono">{systemHealth.php_version}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Server Details</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                        </svg>
                                        <span className="text-white text-sm">{systemHealth.os}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Global SLA Breaches */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Global SLA Breaches
                        </h3>
                        {slaBreached.length === 0 ? (
                            <GlassCard>
                                <div className="text-center py-6">
                                    <p className="text-gray-400">No breached SLAs entirely. Excellent performance.</p>
                                </div>
                            </GlassCard>
                        ) : (
                            <div className="space-y-3">
                                {slaBreached.map(ticket => (
                                    <Link key={ticket.id} href={route('admin.tickets.show', ticket.id)}>
                                        <GlassCard padding="sm" hover className="flex justify-between items-center group border-l-4 border-red-500 bg-red-500/5">
                                            <div>
                                                <h4 className="font-semibold text-white group-hover:text-accent-blue transition-colors">#{ticket.ticket_no} - {ticket.title.substring(0, 40)}{ticket.title.length > 40 ? '...' : ''}</h4>
                                                <p className="text-sm text-gray-400 mt-1">Status: <span className={`text-${getStatusColor(ticket.status)}-400`}>{ticket.status.replaceAll('_', ' ')}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-red-400 font-bold text-sm">Breached</div>
                                                <div className="text-xs text-gray-500">{ticket.due_date}</div>
                                            </div>
                                        </GlassCard>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Recently Onboarded Users
                    </h3>
                    <div className="space-y-4">
                        {recentUsers.map((u) => (
                            <div key={u.id} className="glass-card p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-white">{u.name}</p>
                                        <p className="text-xs text-gray-400 mt-1 capitalize">{u.role}</p>
                                    </div>
                                    <span className="text-xs text-gray-500">{u.date}</span>
                                </div>
                            </div>
                        ))}
                        <div className="text-center pt-2">
                            <Link href={route('superadmin.users.index')} className="text-sm text-gray-400 hover:text-white transition-colors">Manage all users &rarr;</Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
