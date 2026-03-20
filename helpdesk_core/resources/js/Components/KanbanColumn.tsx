import { useDroppable } from '@dnd-kit/core';
import { Ticket } from '@/types';
import KanbanCard from './KanbanCard';

interface Props {
    id: string;
    title: string;
    tickets: Ticket[];
    color: string;
}

export default function KanbanColumn({ id, title, tickets, color }: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const borderColor = color.replace('border-', 'border-').replace('500', '500/50');
    const getHeaderColor = () => {
        if (id === 'NEW') return 'bg-blue-500/10 text-blue-400 dark:text-blue-400 light:text-blue-600';
        if (id === 'ASSIGNED') return 'bg-indigo-500/10 text-indigo-400';
        if (id === 'IN_PROGRESS') return 'bg-yellow-500/10 text-yellow-400';
        if (id === 'WAITING_USER') return 'bg-orange-500/10 text-orange-400';
        if (id === 'WAITING_VENDOR') return 'bg-purple-500/10 text-purple-400 dark:text-purple-400 light:text-purple-600';
        if (id === 'RESOLVED') return 'bg-green-500/10 text-green-400';
        if (id === 'CLOSED') return 'bg-gray-500/10 text-gray-400 dark:text-gray-400 light:text-gray-600';
        return 'bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600';
    };

    return (
        <div className="flex-shrink-0 w-80 flex flex-col h-full max-h-full rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
            <div className={`p-4 rounded-t-2xl border-b border-white/5 flex justify-between items-center sticky top-0 ${getHeaderColor()}`}>
                <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${color.replace('border-', 'bg-')}`}></span>
                    {title}
                </h3>
                <span className="bg-white/10 text-white dark:text-white light:text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                    {tickets.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`flex-1 min-h-0 p-3 overflow-y-auto space-y-3 transition-colors scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${isOver ? 'bg-white/5' : ''}`}
            >
                {tickets.map((ticket) => (
                    <KanbanCard key={ticket.id} ticket={ticket} />
                ))}
                {tickets.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs italic border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                        No tickets
                    </div>
                )}
            </div>
        </div>
    );
}
