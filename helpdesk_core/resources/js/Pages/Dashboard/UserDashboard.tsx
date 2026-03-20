import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import GlassCard from '@/Components/GlassCard';

interface UserDashboardProps extends PageProps {
    stats: {
        open: number;
        pending: number;
        resolved: number;
    };
    recentActivity: Array<{
        id: number;
        ticket_no: string;
        title: string;
        status: string;
        date: string;
        type: string;
    }>;
}

export default function UserDashboard({ auth, stats, recentActivity }: UserDashboardProps) {
    const statsConfig = [
        { label: 'Open Tickets', value: stats.open.toString(), icon: 'ticket', color: 'blue' },
        { label: 'Pending', value: stats.pending.toString(), icon: 'clock', color: 'yellow' },
        { label: 'Resolved', value: stats.resolved.toString(), icon: 'check', color: 'green' },
    ];

    const getStatusColor = (status: string) => {
        const statusUpper = status.toUpperCase();
        if (statusUpper === 'RESOLVED' || statusUpper === 'CLOSED') return 'green';
        if (statusUpper === 'IN_PROGRESS') return 'blue';
        if (statusUpper === 'WAITING_USER' || statusUpper === 'WAITING_VENDOR') return 'yellow';
        return 'gray';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Dashboard"
        >
            <Head title="Dashboard" />

            {/* Welcome Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 tracking-tight">
                            Hello, <span className="gradient-text">{auth.user.name}</span>
                        </h1>
                        <p className="text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 mt-1">Welcome back to your helpdesk portal.</p>
                    </div>

                    <Link href={route('tickets.create')} className="btn-primary flex items-center gap-2 shadow-glow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Ticket
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statsConfig.map((stat, index) => (
                    <GlassCard key={index} className="relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <svg className={`w-24 h-24 text-${stat.color}-400`} fill="currentColor" viewBox="0 0 20 20">
                                {stat.icon === 'ticket' && <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />}
                                {stat.icon === 'clock' && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />}
                                {stat.icon === 'check' && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />}
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <GlassCard>
                                <div className="text-center py-8">
                                    <p className="text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">No recent activity. Create your first ticket to get started!</p>
                                </div>
                            </GlassCard>
                        ) : (
                            <>
                                {recentActivity.map((activity) => (
                                    <Link
                                        key={activity.id}
                                        href={route('my.tickets.show', activity.id)}
                                    >
                                        <GlassCard padding="sm" hover className="flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl bg-${getStatusColor(activity.status)}-500/10 border border-${getStatusColor(activity.status)}-500/20`}>
                                                    <svg className={`w-6 h-6 text-${getStatusColor(activity.status)}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 group-hover:text-accent-blue transition-colors">
                                                        #{activity.ticket_no} - {activity.title.substring(0, 50)}{activity.title.length > 50 ? '...' : ''}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">
                                                        {activity.type} • <span className={`text-${getStatusColor(activity.status)}-400`}>{activity.status.replaceAll('_', ' ')}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 font-medium">
                                                {activity.date}
                                            </div>
                                        </GlassCard>
                                    </Link>
                                ))}
                                <div className="text-center pt-2">
                                    <Link href={route('my.tickets')} className="text-sm text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 hover:text-white dark:hover:text-white dark:text-white light:text-gray-900 light:hover:text-gray-900 transition-colors">View all activity &rarr;</Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Knowledge Base Snippet */}
                <div>
                    <h3 className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <Link href={route('kb.index')} className="glass-card hover p-4 flex items-center gap-4 group">
                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                                <svg className="w-6 h-6 text-purple-400 dark:text-purple-400 light:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">Knowledge Base</h4>
                                <p className="text-xs text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">Find answers quickly</p>
                            </div>
                        </Link>
                        <Link href={route('profile.edit')} className="glass-card hover p-4 flex items-center gap-4 group">
                            <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20 group-hover:bg-gray-500/20 transition-colors">
                                <svg className="w-6 h-6 text-gray-400 dark:text-gray-400 light:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">Profile Settings</h4>
                                <p className="text-xs text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">Update your account</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
