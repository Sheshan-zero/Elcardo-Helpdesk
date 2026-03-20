import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Ticket, User, TicketStatusHistory, TicketComment } from '@/types';
import TicketComments from '@/Components/TicketComments';
import TicketHistory from '@/Components/TicketHistory';
import TicketNotifications from '@/Components/TicketNotifications';
import { useState } from 'react';
import GlassCard from '@/Components/GlassCard';

interface NotificationLog {
    id: number;
    key: string;
    recipient_email: string;
    subject: string;
    status: 'QUEUED' | 'SENT' | 'FAILED';
    error_message: string | null;
    sent_at: string | null;
    created_at: string;
}

interface Props extends PageProps {
    ticket: Ticket & {
        history: TicketStatusHistory[];
        comments: TicketComment[];
        assigned_admin?: User;
        notification_logs?: NotificationLog[];
    };
    admins: User[];
    statuses: string[];
}

export default function Show({ auth, ticket, admins, statuses }: Props) {
    const [statusNote, setStatusNote] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState('');

    const [priorityNote, setPriorityNote] = useState('');
    const [showPriorityModal, setShowPriorityModal] = useState(false);
    const [pendingPriority, setPendingPriority] = useState('');

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

    const handleStatusChange = (newStatus: string) => {
        setPendingStatus(newStatus);
        setShowStatusModal(true);
    };

    const confirmStatusChange = () => {
        router.patch(route('admin.tickets.updateStatus', ticket.id), {
            status: pendingStatus,
            note: statusNote,
        }, {
            onSuccess: () => {
                setShowStatusModal(false);
                setStatusNote('');
                setPendingStatus('');
            }
        });
    };

    const handleAssignmentChange = (adminId: string) => {
        router.patch(route('admin.tickets.assignUser', ticket.id), {
            assigned_admin_id: adminId || null,
        });
    };

    const handlePriorityChange = (newPriority: string) => {
        setPendingPriority(newPriority);
        setShowPriorityModal(true);
    };

    const confirmPriorityChange = () => {
        router.patch(route('admin.tickets.updatePriority', ticket.id), {
            priority: pendingPriority,
            note: priorityNote,
        }, {
            onSuccess: () => {
                setShowPriorityModal(false);
                setPriorityNote('');
                setPendingPriority('');
            }
        });
    };

    const getPriorityBadgeClass = (priority: string | null) => {
        switch (priority?.toUpperCase()) {
            case 'URGENT': return 'bg-red-500/20 text-red-300 dark:text-red-300 light:text-red-700 border-red-500/30 border';
            case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-500/30 border';
            case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-300 light:text-yellow-700 border-yellow-500/30 border';
            case 'LOW': return 'bg-blue-500/20 text-blue-300 dark:text-blue-300 light:text-blue-700 border-blue-500/30 border';
            default: return 'bg-gray-500/20 text-gray-300 dark:text-gray-300 light:text-gray-700 border-gray-500/30 border';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.tickets.index')}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h2 className="font-bold text-xl text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 leading-tight flex items-center gap-2">
                                Ticket <span className="text-accent-cyan">#{ticket.ticket_no}</span>
                            </h2>
                            <span className="text-xs text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">Created {new Date(ticket.created_at).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Dropdown */}
                        <div className="relative">
                            <select
                                value={ticket.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`appearance-none pl-4 pr-10 py-2 rounded-lg text-sm font-bold uppercase tracking-wider cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${getStatusBadgeClass(ticket.status)}`}
                            >
                                {statuses.map((s) => (
                                    <option key={s} value={s} className="bg-gray-800 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">{s.replaceAll('_', ' ')}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-inherit opacity-70">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        {/* Priority Dropdown */}
                        <div className="relative">
                            <select
                                value={ticket.priority || 'MEDIUM'}
                                onChange={(e) => handlePriorityChange(e.target.value)}
                                className={`appearance-none pl-8 pr-10 py-2 rounded-lg text-sm font-bold uppercase tracking-wider cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${getPriorityBadgeClass(ticket.priority || null)}`}
                            >
                                <option value="LOW" className="bg-gray-800 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">Low</option>
                                <option value="MEDIUM" className="bg-gray-800 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">Medium</option>
                                <option value="HIGH" className="bg-gray-800 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">High</option>
                                <option value="URGENT" className="bg-gray-800 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">Urgent</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                <span className={`w-3 h-3 rounded-full ${ticket.priority === 'URGENT' ? 'bg-red-500' :
                                    ticket.priority === 'HIGH' ? 'bg-orange-500' :
                                        ticket.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`}></span>
                            </div>
                        </div>

                        {/* Assignment Dropdown */}
                        <div className="relative">
                            <select
                                value={ticket.assigned_admin_id || ''}
                                onChange={(e) => handleAssignmentChange(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 bg-white/10 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 border border-white/10 rounded-lg text-sm font-medium cursor-pointer hover:bg-white/20 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="" className="bg-gray-800">Unassigned</option>
                                {admins.map((admin) => (
                                    <option key={admin.id} value={admin.id} className="bg-gray-800">{admin.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900/70">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Ticket ${ticket.ticket_no}`} />

            <div className="max-w-8xl mx-auto pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">

                        <GlassCard className="p-8">
                            {/* Requester Info */}
                            <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 shadow-lg">
                                    {ticket.creator?.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 leading-tight">{ticket.creator?.name}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            {ticket.creator?.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            {ticket.phone}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Issue Description */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider mb-3">Issue Description</h3>
                                <div className="bg-white/5 p-6 rounded-xl text-gray-200 dark:text-gray-200 light:text-gray-800 leading-relaxed whitespace-pre-wrap border border-white/5">
                                    {ticket.issue_description}
                                </div>
                            </div>

                            {/* Remote Access Info */}
                            {(ticket.ip_address || ticket.anydesk_code) && (
                                <div className="mb-8 p-6 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                    <h3 className="text-sm font-bold text-blue-300 dark:text-blue-300 light:text-blue-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Remote Access
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {ticket.ip_address && (
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 block mb-1">IP Address</span>
                                                <p className="font-mono text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 bg-black/20 px-3 py-1.5 rounded-lg inline-block border border-white/5">{ticket.ip_address}</p>
                                            </div>
                                        )}
                                        {ticket.anydesk_code && (
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 block mb-1">AnyDesk Code</span>
                                                <p className="font-mono text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 bg-black/20 px-3 py-1.5 rounded-lg inline-block border border-white/5">{ticket.anydesk_code}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 uppercase tracking-wider mb-3">Attachments</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {ticket.attachments.map((attachment) => (
                                            <a
                                                key={attachment.id}
                                                href={`/storage/${attachment.path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                                            >
                                                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 mr-3 group-hover:text-indigo-300">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-gray-200 dark:text-gray-200 light:text-gray-800 truncate group-hover:text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors">{attachment.original_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600">{(attachment.size_bytes / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </GlassCard>

                        {/* Comments Section */}
                        <GlassCard className="p-8">
                            <TicketComments
                                ticketId={ticket.id}
                                comments={ticket.comments || []}
                                userRole={auth.user.role}
                            />
                        </GlassCard>
                    </div>

                    {/* Right Column: SLA, History & Meta */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Meta Info */}
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider block mb-1">Branch</span>
                                    <span className="text-gray-200 dark:text-gray-200 light:text-gray-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {ticket.branch?.name}
                                    </span>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider block mb-1">Module</span>
                                    <span className="text-gray-200 dark:text-gray-200 light:text-gray-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        {ticket.module?.name}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* SLA Status Panel */}
                        {(ticket.first_response_due_at || ticket.resolution_due_at) && (
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-4 flex items-center gap-2">
                                    ⏱️ SLA Status
                                </h3>
                                <div className="space-y-4">
                                    {/* First Response */}
                                    {ticket.first_response_due_at && (() => {
                                        const dueAt = new Date(ticket.first_response_due_at);
                                        const responded = !!ticket.first_admin_action_at;
                                        const breached = !!ticket.first_response_breached_at;
                                        const now = new Date();
                                        const isOverdue = !responded && now > dueAt;
                                        const diffMs = Math.abs(dueAt.getTime() - now.getTime());
                                        const diffH = Math.floor(diffMs / 3600000);
                                        const diffM = Math.floor((diffMs % 3600000) / 60000);

                                        return (
                                            <div className={`p-4 rounded-xl border ${breached || isOverdue ? 'bg-red-500/10 border-red-500/30' : responded ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700">First Response</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${breached || isOverdue ? 'bg-red-500 text-white dark:text-white light:text-gray-900' : responded ? 'bg-green-500 text-white dark:text-white light:text-gray-900' : 'bg-yellow-500 text-white dark:text-white light:text-gray-900'}`}>
                                                        {breached ? 'BREACHED' : responded ? 'MET' : isOverdue ? 'OVERDUE' : 'PENDING'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">Due: <span className="text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">{dueAt.toLocaleString()}</span></p>
                                                {responded && <p className="text-xs text-green-400 mt-1">Responded: {new Date(ticket.first_admin_action_at!).toLocaleString()}</p>}
                                                {!responded && (
                                                    <p className={`text-sm font-bold mt-2 ${isOverdue ? 'text-red-400' : 'text-yellow-400'}`}>
                                                        {isOverdue ? `⚠️ Overdue by ${diffH}h ${diffM}m` : `⏳ ${diffH}h ${diffM}m remaining`}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Resolution */}
                                    {ticket.resolution_due_at && (() => {
                                        const dueAt = new Date(ticket.resolution_due_at);
                                        const resolved = !!ticket.resolved_at;
                                        const breached = !!ticket.resolution_breached_at;
                                        const now = new Date();
                                        const isOverdue = !resolved && now > dueAt;
                                        const diffMs = Math.abs(dueAt.getTime() - now.getTime());
                                        const diffH = Math.floor(diffMs / 3600000);
                                        const diffM = Math.floor((diffMs % 3600000) / 60000);

                                        return (
                                            <div className={`p-4 rounded-xl border ${breached || isOverdue ? 'bg-red-500/10 border-red-500/30' : resolved ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700">Resolution</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${breached || isOverdue ? 'bg-red-500 text-white dark:text-white light:text-gray-900' : resolved ? 'bg-green-500 text-white dark:text-white light:text-gray-900' : 'bg-yellow-500 text-white dark:text-white light:text-gray-900'}`}>
                                                        {breached ? 'BREACHED' : resolved ? 'MET' : isOverdue ? 'OVERDUE' : 'PENDING'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">Due: <span className="text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900">{dueAt.toLocaleString()}</span></p>
                                                {resolved && <p className="text-xs text-green-400 mt-1">Resolved: {new Date(ticket.resolved_at!).toLocaleString()}</p>}
                                                {!resolved && (
                                                    <p className={`text-sm font-bold mt-2 ${isOverdue ? 'text-red-400' : 'text-yellow-400'}`}>
                                                        {isOverdue ? `⚠️ Overdue by ${diffH}h ${diffM}m` : `⏳ ${diffH}h ${diffM}m remaining`}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </GlassCard>
                        )}

                        <TicketHistory history={ticket.history || []} />
                        <TicketNotifications logs={ticket.notification_logs || []} />
                    </div>
                </div>
            </div>

            {/* Status Change Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 m-4 shadow-glass-lg scale-100 animate-slide-up">
                        <h3 className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-4">Update Status</h3>
                        <p className="mb-4 text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700">
                            Changing status to <span className="font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 px-2 py-1 bg-white/10 rounded">{pendingStatus}</span>.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 mb-2">
                                Note (Optional)
                            </label>
                            <textarea
                                className="textarea-dark w-full"
                                rows={3}
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Reason for change..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 hover:text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                className="btn-primary"
                            >
                                Confirm Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Priority Change Modal */}
            {showPriorityModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 m-4 shadow-glass-lg scale-100 animate-slide-up">
                        <h3 className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-4">Update Priority</h3>
                        <p className="mb-4 text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700">
                            Changing priority to <span className={`font-bold px-2 py-1 rounded ${getPriorityBadgeClass(pendingPriority)}`}>{pendingPriority}</span>.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 mb-2">
                                Note (Optional)
                            </label>
                            <textarea
                                className="textarea-dark w-full"
                                rows={3}
                                value={priorityNote}
                                onChange={(e) => setPriorityNote(e.target.value)}
                                placeholder="Reason for priority change..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowPriorityModal(false)}
                                className="px-4 py-2 text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 hover:text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPriorityChange}
                                className="btn-primary"
                            >
                                Confirm Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
