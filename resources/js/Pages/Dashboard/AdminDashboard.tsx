import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import GlassCard from '@/Components/GlassCard';

interface AdminDashboardProps extends PageProps {
    stats: {
        assigned: number;
        unassigned: number;
        sla_alerts_count: number;
    };
    slaAlerts: Array<{
        id: number;
        ticket_no: string;
        title: string;
        status: string;
        due_date: string;
        is_breached: boolean;
    }>;
    recentActivity: Array<{
        id: number;
        ticket_no: string;
        title: string;
        status: string;
        date: string;
        type: string;
    }>;
}

export default function AdminDashboard({ auth, stats, slaAlerts, recentActivity }: AdminDashboardProps) {
    const statsConfig = [
        { label: 'Assigned to Me', value: stats.assigned.toString(), icon: 'user', color: 'blue' },
        { label: 'New / Unassigned', value: stats.unassigned.toString(), icon: 'inbox', color: 'yellow' },
        { label: 'Breached SLA Alerts', value: stats.sla_alerts_count.toString(), icon: 'alert', color: 'red' },
    ];

    const getStatusColor = (status: string) => {
        const statusUpper = status.toUpperCase();
        if (statusUpper === 'RESOLVED' || statusUpper === 'CLOSED') return 'green';
        if (statusUpper === 'IN_PROGRESS') return 'blue';
        if (statusUpper === 'WAITING_USER' || statusUpper === 'WAITING_VENDOR') return 'yellow';
        if (statusUpper === 'NEW') return 'purple';
        return 'gray';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Admin Dashboard"
        >
            <Head title="Admin Dashboard" />

            {/* Welcome Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 tracking-tight">
                            Admin <span className="gradient-text">Portal</span>
                        </h1>
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">Manage tickets and resolve issues.</p>
                    </div>

                    <Link href={route('admin.tickets.create')} className="btn-primary flex items-center gap-2 shadow-glow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Ticket
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statsConfig.map((stat, index) => (
                    <GlassCard key={index} className="relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <svg className={`w-24 h-24 text-${stat.color}-400`} fill="currentColor" viewBox="0 0 20 20">
                                {stat.icon === 'user' && <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />}
                                {stat.icon === 'inbox' && <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd" />}
                                {stat.icon === 'alert' && <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />}
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - SLA Watchlist */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        SLA Watchlist
                    </h3>
                    <div className="space-y-4">
                        {slaAlerts.length === 0 ? (
                            <GlassCard>
                                <div className="text-center py-8">
                                    <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">No tickets close to breaching SLA. Good job!</p>
                                </div>
                            </GlassCard>
                        ) : (
                            <>
                                {slaAlerts.map((ticket) => (
                                    <Link key={ticket.id} href={route('admin.tickets.show', ticket.id)}>
                                        <GlassCard padding="sm" hover className={`flex items-center justify-between group cursor-pointer border-l-4 ${ticket.is_breached ? 'border-red-500 bg-red-500/5' : 'border-yellow-500 bg-yellow-500/5'}`}>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h4 className="font-semibold text-white dark:text-white light:text-gray-900 group-hover:text-accent-blue transition-colors">
                                                        #{ticket.ticket_no} - {ticket.title.substring(0, 40)}{ticket.title.length > 40 ? '...' : ''}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
                                                        Status: <span className={`text-${getStatusColor(ticket.status)}-400`}>{ticket.status.replaceAll('_', ' ')}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-bold ${ticket.is_breached ? 'text-red-400' : 'text-yellow-400'}`}>
                                                    {ticket.is_breached ? 'Breached' : 'Due'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-400">
                                                    {ticket.due_date}
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </Link>
                                ))}
                                <div className="text-center pt-2">
                                    <Link href={route('admin.tickets.index')} className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">View all tickets &rarr;</Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <Link href={route('admin.kanban')} className="glass-card hover p-4 flex items-center gap-4 group">
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white dark:text-white light:text-gray-900">Kanban Board</h4>
                                <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">Visual ticket management</p>
                            </div>
                        </Link>
                    </div>

                    <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? recentActivity.map((activity) => (
                            <Link key={activity.id} href={route('admin.tickets.show', activity.id)}>
                                <GlassCard padding="sm" hover className="group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-${getStatusColor(activity.status)}-500/10`}>
                                            <svg className={`w-4 h-4 text-${getStatusColor(activity.status)}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate group-hover:text-accent-blue transition-colors">
                                                #{activity.ticket_no}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{activity.date}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        )) : (
                            <p className="text-sm text-gray-400">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
