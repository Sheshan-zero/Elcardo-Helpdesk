import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, Ticket, TicketComment } from '@/types';
import TicketComments from '@/Components/TicketComments';
import { useState } from 'react';
import GlassCard from '@/Components/GlassCard';

interface Props extends PageProps {
    ticket: Ticket & { comments: TicketComment[] };
}

export default function Show({ auth, ticket, flash }: Props) {
    const [notFixedNote, setNotFixedNote] = useState('');
    const [showNotFixedModal, setShowNotFixedModal] = useState(false);

    const { post, processing, setData } = useForm({
        note: ''
    });

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

    const handleConfirmFixed = () => {
        if (confirm('Are you sure you want to close this ticket?')) {
            post(route('tickets.confirmFixed', ticket.id));
        }
    };

    const handleNotFixedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('note', notFixedNote);
        post(route('tickets.notFixed', ticket.id), {
            onSuccess: () => {
                setShowNotFixedModal(false);
                setNotFixedNote('');
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('my.tickets')}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h2 className="font-bold text-xl text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 leading-tight">
                            Ticket <span className="text-accent-cyan">#{ticket.ticket_no}</span>
                        </h2>
                    </div>
                    <span className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider rounded-full shadow-glow ${getStatusBadgeClass(ticket.status)}`}>
                        {ticket.status}
                    </span>
                </div>
            }
        >
            <Head title={`Ticket ${ticket.ticket_no}`} />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {flash?.success && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-3 animate-fade-in">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-fade-in">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {flash.error}
                            </div>
                        )}

                        {/* Resolution Actions */}
                        {ticket.status === 'RESOLVED' && (
                            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl shadow-glow animate-pulse-slow">
                                <h3 className="text-lg font-bold text-green-400 mb-2">Has your issue been resolved?</h3>
                                <p className="text-green-200 dark:text-green-200 light:text-green-800/80 mb-6 font-medium">
                                    Our team has marked this ticket as resolved. Please confirm if the issue is fixed or if you still need assistance.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={handleConfirmFixed}
                                        className="btn-primary bg-green-600 hover:bg-green-500 border-none shadow-lg shadow-green-900/20"
                                        disabled={processing}
                                    >
                                        ✅ Yes, it's Fixed
                                    </button>
                                    <button
                                        onClick={() => setShowNotFixedModal(true)}
                                        className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 font-bold transition-all"
                                        disabled={processing}
                                    >
                                        ❌ No, Still broken
                                    </button>
                                </div>
                            </div>
                        )}

                        <GlassCard className="p-8">
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
                                <div>
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
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-4">Discussion History</h3>
                            <GlassCard className="p-0 overflow-hidden">
                                <TicketComments
                                    ticketId={ticket.id}
                                    comments={ticket.comments || []}
                                    userRole="user"
                                />
                            </GlassCard>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Ticket Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider block mb-1">Ticket Number</span>
                                    <span className="text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 font-mono bg-white/10 px-2 py-1 rounded text-sm">{ticket.ticket_no}</span>
                                </div>
                                <div className="h-px bg-white/5"></div>
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
                                <div className="h-px bg-white/5"></div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider block mb-1">Contact</span>
                                    <span className="text-gray-200 dark:text-gray-200 light:text-gray-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {ticket.phone}
                                    </span>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider block mb-1">Created On</span>
                                    <span className="text-gray-200 dark:text-gray-200 light:text-gray-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* Not Fixed Modal */}
            {showNotFixedModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 m-4 shadow-glass-lg scale-100 animate-slide-up">
                        <div className="flex items-center gap-3 mb-4 text-red-400">
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold">Report Issue Not Fixed</h3>
                        </div>

                        <p className="mb-6 text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700">
                            Please describe why the issue is not fixed so we can assist you further. Be specific about what is still not working.
                        </p>

                        <form onSubmit={handleNotFixedSubmit}>
                            <div className="mb-6">
                                <textarea
                                    className="textarea-dark w-full h-32"
                                    value={notFixedNote}
                                    onChange={(e) => setNotFixedNote(e.target.value)}
                                    placeholder="The issue persists when I try to..."
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNotFixedModal(false)}
                                    className="px-4 py-2 text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 hover:text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!notFixedNote.trim() || processing}
                                    className="btn-primary bg-red-600 hover:bg-red-500 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
