import { TicketStatusHistory } from '@/types';

interface Props {
    history: TicketStatusHistory[];
}

export default function TicketHistory({ history }: Props) {
    if (history.length === 0) return null;

    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
            </h3>
            <div className="flow-root max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <ul className="-mb-8">
                    {history.map((event, eventIdx) => (
                        <li key={event.id}>
                            <div className="relative pb-8">
                                {eventIdx !== history.length - 1 ? (
                                    <span
                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/10"
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-black/20 text-lg shadow-inner">
                                            📝
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                                                <span className="font-semibold text-white dark:text-white light:text-gray-900">
                                                    {event.user?.name}
                                                </span>{' '}
                                                changed status from{' '}
                                                <span className="font-medium text-accent-blue">{event.from_status?.replaceAll('_', ' ') || 'None'}</span>
                                                {' '}to{' '}
                                                <span className="font-medium text-accent-green">{event.to_status.replaceAll('_', ' ')}</span>
                                            </p>
                                            {event.note && (
                                                <p className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 italic mt-1 bg-black/20 p-2 rounded border border-white/5">
                                                    "{event.note}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right text-xs whitespace-nowrap text-gray-600">
                                            {new Date(event.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
