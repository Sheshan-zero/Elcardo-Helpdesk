import { formatDistanceToNow } from 'date-fns';

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

interface Props {
    logs: NotificationLog[];
}

export default function TicketNotifications({ logs }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SENT':
                return 'bg-green-500/20 text-green-300 dark:text-green-300 light:text-green-700 border border-green-500/30';
            case 'FAILED':
                return 'bg-red-500/20 text-red-300 dark:text-red-300 light:text-red-700 border border-red-500/30';
            case 'QUEUED':
            default:
                return 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-300 light:text-yellow-700 border border-yellow-500/30';
        }
    };

    const getEventLabel = (key: string) => {
        const labels: Record<string, string> = {
            ticket_received: 'Ticket Received',
            ticket_assigned: 'Ticket Assigned',
            ticket_in_progress: 'In Progress',
            ticket_resolved: 'Ticket Resolved',
            ticket_closed: 'Ticket Closed',
        };
        return labels[key] || key;
    };

    if (logs.length === 0) {
        return (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">📧</span> Email Notifications
                </h3>
                <p className="text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">No emails have been sent for this ticket yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📧</span> Email Notifications
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
                {logs.map((log) => (
                    <div key={log.id} className="border border-white/10 bg-white/5 rounded-xl p-3 text-sm hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white dark:text-white light:text-gray-900">
                                {getEventLabel(log.key)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-lg uppercase tracking-wider ${getStatusBadge(log.status)}`}>
                                {log.status}
                            </span>
                        </div>
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 truncate text-xs">
                            To: <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">{log.recipient_email}</span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {log.sent_at
                                ? `Sent ${formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })}`
                                : `Queued ${formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}`
                            }
                        </p>
                        {log.status === 'FAILED' && log.error_message && (
                            <p className="text-red-400 text-xs mt-2 bg-red-500/10 p-2 rounded border border-red-500/20 truncate" title={log.error_message}>
                                Error: {log.error_message}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
