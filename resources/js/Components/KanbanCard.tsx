import { Ticket } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '@inertiajs/react';

interface Props {
    ticket: Ticket;
}

function isOverdue(dueAt: string | null | undefined, doneAt: string | null | undefined): boolean {
    if (!dueAt) return false;
    if (doneAt) return false;
    return new Date() > new Date(dueAt);
}

export default function KanbanCard({ ticket }: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: ticket.id.toString(),
        data: { ticket },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const frOverdue = isOverdue(ticket.first_response_due_at, ticket.first_admin_action_at);
    const resOverdue = isOverdue(ticket.resolution_due_at, ticket.resolved_at);
    const hasOverdue = frOverdue || resOverdue;

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-indigo-600/20 p-4 rounded-xl shadow-glass-lg border border-indigo-500/50 backdrop-blur-md opacity-80 cursor-grabbing rotate-3"
            >
                <div className="h-24"></div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-glass-lg ${hasOverdue
                    ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-xs font-bold text-gray-300 dark:text-gray-300 light:text-gray-700 bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                    {ticket.ticket_no}
                </span>
                <div className="flex gap-1.5 items-center">
                    {frOverdue && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-500 text-white dark:text-white light:text-gray-900 animate-pulse shadow-red-glow">
                            FR
                        </span>
                    )}
                    {resOverdue && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-500 text-white dark:text-white light:text-gray-900 shadow-orange-glow">
                            RES
                        </span>
                    )}
                    {ticket.priority && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${ticket.priority === 'URGENT' ? 'bg-red-500/20 text-red-300 dark:text-red-300 light:text-red-700 border-red-500/30' :
                                ticket.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                    'bg-blue-500/20 text-blue-300 dark:text-blue-300 light:text-blue-700 border-blue-500/30'
                            }`}>
                            {ticket.priority}
                        </span>
                    )}
                </div>
            </div>

            <h4 className="text-sm font-semibold text-white dark:text-white light:text-gray-900 line-clamp-2 mb-3 leading-snug" title={ticket.issue_description}>
                {ticket.issue_description}
            </h4>

            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 px-2 py-0.5 rounded border border-white/5">
                    {ticket.branch?.name}
                </span>
                <span className="text-[10px] bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 px-2 py-0.5 rounded border border-white/5">
                    {ticket.module?.name}
                </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
                <div className="flex items-center space-x-2">
                    {ticket.assigned_admin ? (
                        <div className="flex items-center gap-1.5 bg-indigo-500/20 px-2 py-1 rounded-full border border-indigo-500/30">
                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white dark:text-white light:text-gray-900 font-bold">
                                {ticket.assigned_admin.name.charAt(0)}
                            </div>
                            <span className="text-xs text-indigo-300 font-medium truncate max-w-[80px]">
                                {ticket.assigned_admin.name.split(' ')[0]}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 italic px-2">Unassigned</span>
                    )}
                </div>

                <Link
                    href={route('admin.tickets.show', ticket.id)}
                    className="text-xs text-accent-cyan hover:text-white dark:text-white light:text-gray-900 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                >
                    View Details →
                </Link>
            </div>

            <div className="mt-3 flex gap-2 items-center">
                {ticket.ip_address && <span className="text-[9px] font-mono bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">IP</span>}
                {ticket.anydesk_code && <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 dark:text-purple-400 light:text-purple-600 px-1.5 py-0.5 rounded border border-purple-500/20">AnyDesk</span>}

                <span className="text-[10px] text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 ml-auto">
                    {new Date(ticket.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
            </div>
        </div>
    );
}
