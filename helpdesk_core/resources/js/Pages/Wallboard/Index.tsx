import { Head } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface WallboardTicket {
    id: number;
    ticket_no: string;
    branch: string;
    module: string;
    status: string;
    priority: string;
    created_at: string;
    has_ip: boolean;
    has_anydesk: boolean;
    user_name: string | null;
    admin_name: string | null;
}

interface WallboardData {
    generated_at: string;
    columns: Record<string, WallboardTicket[]>;
    settings: {
        warn_hours: number;
        critical_hours: number;
        show_admin_name: boolean;
        show_remote_badges: boolean;
    };
}

interface Props {
    settings: {
        refresh_interval: number;
        visible_columns: string[];
        show_admin_name: boolean;
        user_display: string;
        show_remote_badges: boolean;
        warn_hours: number;
        critical_hours: number;
    };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; gradient: string }> = {
    NEW: {
        label: 'New',
        color: 'text-blue-400 dark:text-blue-400 light:text-blue-600',
        gradient: 'from-blue-600/20 to-blue-900/20 border-blue-500/30'
    },
    ASSIGNED: {
        label: 'Assigned',
        color: 'text-indigo-400',
        gradient: 'from-indigo-600/20 to-indigo-900/20 border-indigo-500/30'
    },
    IN_PROGRESS: {
        label: 'In Progress',
        color: 'text-amber-400',
        gradient: 'from-amber-600/20 to-amber-900/20 border-amber-500/30'
    },
    WAITING_USER: {
        label: 'Waiting User',
        color: 'text-orange-400',
        gradient: 'from-orange-600/20 to-orange-900/20 border-orange-500/30'
    },
    WAITING_VENDOR: {
        label: 'Waiting Vendor',
        color: 'text-purple-400 dark:text-purple-400 light:text-purple-600',
        gradient: 'from-purple-600/20 to-purple-900/20 border-purple-500/30'
    },
    RESOLVED: {
        label: 'Resolved',
        color: 'text-emerald-400',
        gradient: 'from-emerald-600/20 to-emerald-900/20 border-emerald-500/30'
    },
    CLOSED: {
        label: 'Closed',
        color: 'text-gray-400 dark:text-gray-400 light:text-gray-600',
        gradient: 'from-gray-600/20 to-gray-900/20 border-gray-500/30'
    },
};

export default function WallboardIndex({ settings }: Props) {
    const [data, setData] = useState<WallboardData | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Calculate age
    const getAge = (createdAt: string): string => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d`;
        if (diffHours > 0) return `${diffHours}h`;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins}m`;
    };

    // Get age severity class
    const getAgeSeverity = (createdAt: string, warnHours: number, criticalHours: number): string => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

        if (diffHours >= criticalHours) return 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]';
        if (diffHours >= warnHours) return 'bg-amber-500/20 text-amber-400 border border-amber-500/50';
        return 'bg-white/10 text-gray-300 dark:text-gray-300 light:text-gray-700 border border-white/10';
    };

    // Priority badge
    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return <span className="px-2 py-0.5 bg-red-600 text-white dark:text-white light:text-gray-900 text-[10px] font-black tracking-wider rounded uppercase shadow-lg shadow-red-600/40 animate-pulse">URGENT</span>;
            case 'HIGH':
                return <span className="px-2 py-0.5 bg-orange-500 text-white dark:text-white light:text-gray-900 text-[10px] font-bold tracking-wider rounded uppercase shadow shadow-orange-500/30">HIGH</span>;
            default: return null;
        }
    };

    // Fetch data
    const fetchData = async () => {
        try {
            const currentUrl = new URL(window.location.href);
            const response = await axios.get('/api/wallboard/tickets' + currentUrl.search, {
                headers: { 'X-Wallboard-Request': 'true' }
            });
            setData(response.data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and interval
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, settings.refresh_interval * 1000);
        return () => clearInterval(interval);
    }, [settings.refresh_interval]);

    // Count totals
    const totalOpen = data ? Object.values(data.columns).flat().filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length : 0;
    const urgentCount = data ? Object.values(data.columns).flat().filter(t => t.priority === 'URGENT').length : 0;

    if (error && !data) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-sans">
                <div className="text-red-400 text-2xl font-light glass-card p-10 border border-red-500/30">
                    ⚠️ {error}
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Elcardo Monitor" />
            <div className="min-h-screen bg-[#0f172a] text-white dark:text-white light:text-gray-900 font-sans overflow-hidden bg-[url('/img/grid.svg')] bg-fixed">
                <style>{`
                    .glass-panel {
                        background: rgba(15, 23, 42, 0.6);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                    }
                    .glass-card {
                        background: rgba(30, 41, 59, 0.7);
                        backdrop-filter: blur(8px);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    ::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.2);
                    }
                    ::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 3px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }
                `}</style>

                {/* Header */}
                <header className="glass-panel sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-2xl shadow-indigo-500/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-2xl">🖥️</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white dark:text-white light:text-gray-900">Elcardo <span className="text-indigo-400">Helpdesk</span></h1>
                            <p className="text-xs text-indigo-200/60 uppercase tracking-widest font-semibold">Live Operations Monitor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Stats */}
                        <div className="flex items-center gap-6 px-6 py-2 bg-white/5 rounded-full border border-white/5">
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[10px] text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider font-bold mb-1">Open Tickets</span>
                                <span className="text-2xl font-bold text-white dark:text-white light:text-gray-900">{totalOpen}</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[10px] text-red-300 dark:text-red-300 light:text-red-700 uppercase tracking-wider font-bold mb-1">Critical</span>
                                <span className={`text-2xl font-bold ${urgentCount > 0 ? 'text-red-400 animate-pulse' : 'text-gray-400 dark:text-gray-400 light:text-gray-600'}`}>
                                    {urgentCount}
                                </span>
                            </div>
                        </div>

                        {/* Clock / Status */}
                        <div className="text-right">
                            <div className="text-xl font-mono font-bold text-gray-200 dark:text-gray-200 light:text-gray-800">
                                {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">System Live</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-6 h-[calc(100vh-88px)] flex flex-col overflow-hidden">
                    {loading && !data ? (
                        <div className="h-full flex items-center justify-center flex-col gap-4">
                            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-indigo-300 animate-pulse">Initializing Wallboard Stream...</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar">
                            <div className="grid h-full gap-6 min-w-max pr-8" style={{ gridTemplateColumns: `repeat(${settings.visible_columns.length}, minmax(300px, 1fr))` }}>
                                {settings.visible_columns.map((status) => {
                                    const config = STATUS_CONFIG[status] || { label: status, color: 'text-gray-400 dark:text-gray-400 light:text-gray-600', gradient: 'from-gray-700/50 to-gray-800/50' };
                                    const tickets = data?.columns[status] || [];

                                    return (
                                        <div key={status} className={`glass-panel rounded-2xl overflow-hidden flex flex-col h-full bg-gradient-to-b ${config.gradient}`}>
                                            {/* Column Header */}
                                            <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}></div>
                                                    <h2 className={`text-lg font-bold tracking-tight ${config.color}`}>{config.label}</h2>
                                                </div>
                                                <span className="bg-white/10 px-2 py-0.5 rounded-md text-sm font-bold text-white dark:text-white light:text-gray-900 min-w-[2rem] text-center border border-white/5">
                                                    {tickets.length}
                                                </span>
                                            </div>

                                            {/* Tickets List */}
                                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3 custom-scrollbar">
                                                {tickets.map((ticket) => (
                                                    <div
                                                        key={ticket.id}
                                                        className="glass-card rounded-xl p-4 hover:bg-white/5 transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-indigo-500"
                                                    >
                                                        {/* Top Row: Ticket # and Age */}
                                                        <div className="flex items-start justify-between mb-3">
                                                            <span className="text-lg font-bold text-white dark:text-white light:text-gray-900 tracking-tight group-hover:text-indigo-300 transition-colors">
                                                                {ticket.ticket_no}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getAgeSeverity(ticket.created_at, settings.warn_hours, settings.critical_hours)}`}>
                                                                {getAge(ticket.created_at)}
                                                            </span>
                                                        </div>

                                                        {/* Middle Row: Location/Module */}
                                                        <div className="mb-3">
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">
                                                                <span className="text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600">📍</span>
                                                                <span className="font-semibold text-gray-300 dark:text-gray-300 light:text-gray-700 truncate">{ticket.branch}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                                                                <span className="text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600">📦</span>
                                                                <span className="text-gray-300 dark:text-gray-300 light:text-gray-700 truncate">{ticket.module}</span>
                                                            </div>
                                                        </div>

                                                        {/* Bottom Row: Badges & Users */}
                                                        <div className="flex items-end justify-between mt-auto">
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-1">
                                                                    {getPriorityBadge(ticket.priority)}
                                                                    {settings.show_remote_badges && ticket.has_ip && (
                                                                        <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 border border-cyan-500/30 text-[10px] font-bold rounded uppercase">IP</span>
                                                                    )}
                                                                    {settings.show_remote_badges && ticket.has_anydesk && (
                                                                        <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold rounded uppercase">AD</span>
                                                                    )}
                                                                </div>

                                                                {(ticket.user_name || ticket.admin_name) && (
                                                                    <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
                                                                        {ticket.user_name && <span>👤 {ticket.user_name}</span>}
                                                                        {settings.show_admin_name && ticket.admin_name && (
                                                                            <span className="text-indigo-400">🛠️ {ticket.admin_name}</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {tickets.length === 0 && (
                                                    <div className="h-32 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                                                        <span className="text-2xl mb-2 opacity-20">📭</span>
                                                        <span className="text-sm font-medium">No Tickets</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
