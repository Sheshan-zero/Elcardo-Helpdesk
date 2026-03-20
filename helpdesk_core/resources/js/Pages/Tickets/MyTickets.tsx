import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Ticket, PaginatedData } from '@/types';
import GlassCard from '@/Components/GlassCard';

interface Props extends PageProps {
    tickets: PaginatedData<Ticket>;
}

export default function MyTickets({ auth, tickets, flash }: Props) {
    const getStatusBadgeClass = (status: string) => {
        switch (status.toUpperCase()) {
            case 'NEW':
                return 'bg-blue-500/20 text-blue-300 dark:text-blue-300 light:text-blue-700 border border-blue-500/30';
            case 'ASSIGNED':
                return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
            case 'IN_PROGRESS':
                return 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-300 light:text-yellow-700 border border-yellow-500/30';
            case 'WAITING_USER':
                return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
            case 'WAITING_VENDOR':
                return 'bg-purple-500/20 text-purple-300 dark:text-purple-300 light:text-purple-700 border border-purple-500/30';
            case 'RESOLVED':
                return 'bg-green-500/20 text-green-300 dark:text-green-300 light:text-green-700 border border-green-500/30';
            case 'CLOSED':
                return 'bg-gray-500/20 text-gray-300 dark:text-gray-300 light:text-gray-700 border border-gray-500/30';
            default:
                return 'bg-gray-500/20 text-gray-300 dark:text-gray-300 light:text-gray-700 border border-gray-500/30';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="My Tickets"
        >
            <Head title="My Tickets" />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">Ticket History</h2>
                        <p className="text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 text-sm">Track and manage your comprehensive support requests.</p>
                    </div>

                    <Link
                        href={route('tickets.create')}
                        className="btn-primary flex items-center gap-2 shadow-glow"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Ticket
                    </Link>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-3 animate-fade-in">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                <GlassCard className="overflow-hidden">
                    {tickets.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-2">No tickets found</h3>
                            <p className="text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 mb-6">You haven't submitted any support requests yet.</p>
                            <Link
                                href={route('tickets.create')}
                                className="text-accent-blue hover:text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors font-medium"
                            >
                                Submit your first ticket &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 text-left">
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Ticket No</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Module</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {tickets.data.map((ticket) => (
                                        <tr key={ticket.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm font-medium text-accent-cyan">
                                                    #{ticket.ticket_no}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 truncate max-w-xs" title={ticket.issue_description}>
                                                    {ticket.issue_description.length > 50
                                                        ? `${ticket.issue_description.substring(0, 50)}...`
                                                        : ticket.issue_description}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600">{ticket.branch?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">
                                                {ticket.module?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                                                    {ticket.status.replaceAll('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('my.tickets.show', ticket.id)}
                                                    className="text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 hover:text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tickets.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-white/10 flex justify-center items-center gap-2">
                            {tickets.links.map((link, index) => {
                                const label = link.label
                                    .replace('&laquo;', '«')
                                    .replace('&raquo;', '»');
                                return (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${link.active
                                            ? 'bg-accent-blue text-white dark:text-white light:text-gray-900 shadow-glow'
                                            : link.url
                                                ? 'bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-white/10 hover:text-white dark:text-white light:text-gray-900'
                                                : 'text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </GlassCard>
            </div>
        </AuthenticatedLayout>
    );
}
