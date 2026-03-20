import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Ticket, Branch, Module, PaginatedData } from '@/types';
import { useState } from 'react';
import GlassCard from '@/Components/GlassCard';

interface Props extends PageProps {
    tickets: PaginatedData<Ticket>;
    branches: Pick<Branch, 'id' | 'name'>[];
    modules: Pick<Module, 'id' | 'name'>[];
    filters: {
        branch_id?: string;
        module_id?: string;
        status?: string;
        search?: string;
        assigned_admin_id?: string;
    };
    admins: { id: number; name: string }[];
}

export default function Index({ auth, tickets, branches, modules, filters, admins }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const getStatusBadgeClass = (status: string) => {
        switch (status.toUpperCase()) {
            case 'NEW': return 'bg-blue-500/20 text-blue-300 dark:text-blue-300 light:text-blue-700 border border-blue-500/30';
            case 'ASSIGNED': return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
            case 'IN_PROGRESS': return 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-300 light:text-yellow-700 border border-yellow-500/30';
            case 'WAITING_USER': return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
            case 'WAITING_VENDOR': return 'bg-purple-500/20 text-purple-300 dark:text-purple-300 light:text-purple-700 border border-purple-500/30';
            case 'RESOLVED': return 'bg-green-500/20 text-green-300 dark:text-green-300 light:text-green-700 border border-green-500/30';
            case 'CLOSED': return 'bg-gray-500/20 text-gray-300 dark:text-gray-300 light:text-gray-700 border border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-300 dark:text-gray-300 light:text-gray-700 border border-gray-500/30';
        }
    };

    const handleFilter = (key: string, value: string) => {
        router.get(route('admin.tickets.index'), {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="font-bold text-xl text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 leading-tight">Ticket Management</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href={route('admin.tickets.create')} className="px-4 py-2 bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue border border-accent-blue/30 rounded-lg transition-colors text-sm font-medium">
                            + Create Ticket
                        </Link>
                        <Link href={route('admin.reports.index')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 rounded-lg transition-colors text-sm font-medium border border-white/10">
                            View Reports
                        </Link>
                        <Link href={route('admin.kanban')} className="px-4 py-2 bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple border border-accent-purple/30 rounded-lg transition-colors text-sm font-medium">
                            Kanban Board
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="All Tickets" />

            <div className="max-w-8xl mx-auto pb-12">
                <div className="space-y-6">
                    {/* Filters */}
                    <GlassCard className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                            <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md flex relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search tickets, issuers..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input-dark w-full pl-10 py-2"
                                />
                            </form>

                            <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto">
                                <select
                                    value={filters.branch_id || ''}
                                    onChange={(e) => handleFilter('branch_id', e.target.value)}
                                    className="select-dark text-sm py-2"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.module_id || ''}
                                    onChange={(e) => handleFilter('module_id', e.target.value)}
                                    className="select-dark text-sm py-2"
                                >
                                    <option value="">All Modules</option>
                                    {modules.map((module) => (
                                        <option key={module.id} value={module.id}>{module.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.assigned_admin_id || ''}
                                    onChange={(e) => handleFilter('assigned_admin_id', e.target.value)}
                                    className="select-dark text-sm py-2"
                                >
                                    <option value="">All Admins</option>
                                    <option value="unassigned">Unassigned</option>
                                    {admins.map((admin) => (
                                        <option key={admin.id} value={admin.id}>{admin.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => handleFilter('status', e.target.value)}
                                    className="select-dark text-sm py-2"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="NEW">New</option>
                                    <option value="ASSIGNED">Assigned</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="WAITING_USER">Waiting User</option>
                                    <option value="WAITING_VENDOR">Waiting Vendor</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed</option>
                                </select>

                                {(filters.search || filters.branch_id || filters.module_id || filters.status || filters.assigned_admin_id) && (
                                    <button
                                        onClick={() => router.get(route('admin.tickets.index'))}
                                        className="px-3 py-2 text-sm text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 hover:text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors border border-white/10 rounded-lg hover:bg-white/5"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Tickets Table */}
                    <GlassCard className="overflow-hidden p-0">
                        {tickets.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-2">No tickets found</h3>
                                <p className="text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 text-left">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Ticket</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Assignee</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {tickets.data.map((ticket) => (
                                            <tr key={ticket.id} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-sm font-bold text-accent-cyan">
                                                            #{ticket.ticket_no}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
                                                            {new Date(ticket.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs truncate text-sm font-medium text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900" title={ticket.issue_description}>
                                                        {ticket.issue_description}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 mt-0.5">
                                                        by {ticket.creator?.name} &bull; {ticket.phone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700">{ticket.branch?.name}</span>
                                                    </div>
                                                    <div className="mt-1 text-xs">{ticket.module?.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {ticket.assigned_admin ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                                                                {ticket.assigned_admin.name.charAt(0)}
                                                            </div>
                                                            <span className="text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700">{ticket.assigned_admin.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 italic text-xs">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wide ${getStatusBadgeClass(ticket.status)}`}>
                                                        {ticket.status.replaceAll('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <Link
                                                        href={route('admin.tickets.show', ticket.id)}
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 rounded-lg border border-white/10 transition-colors inline-block"
                                                    >
                                                        Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {tickets.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-white/10 flex justify-center items-center gap-2">
                                {tickets.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${link.active
                                            ? 'bg-accent-blue text-white dark:text-white light:text-gray-900 shadow-glow'
                                            : link.url
                                                ? 'bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-white/10 hover:text-white dark:text-white light:text-gray-900'
                                                : 'text-gray-600 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
