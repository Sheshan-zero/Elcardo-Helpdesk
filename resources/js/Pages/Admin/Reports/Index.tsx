import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '@/Components/GlassCard';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface Branch { id: number; name: string; }
interface Module { id: number; name: string; }
interface Admin { id: number; name: string; }

interface Props extends PageProps {
    branches: Branch[];
    modules: Module[];
    admins: Admin[];
    filters: Record<string, string>;
}

interface Summary {
    total_created: number;
    total_resolved: number;
    total_closed: number;
    current_open: number;
    avg_resolve_time_hours: number;
    reopen_rate_percent: number;
}

interface VolumeTrend {
    period: string;
    created: number;
    resolved: number;
}

interface BreakdownItem {
    name: string;
    count: number;
}

interface LongestOpenTicket {
    id: number;
    ticket_no: string;
    branch: string;
    module: string;
    status: string;
    assigned_admin: string;
    age_days: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export default function ReportsIndex({ auth, branches, modules, admins }: Props) {
    const [activeTab, setActiveTab] = useState<'summary' | 'volume' | 'breakdowns' | 'performance'>('summary');
    const [loading, setLoading] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [branchId, setBranchId] = useState<string>('');
    const [moduleId, setModuleId] = useState<string>('');
    const [assignedAdminId, setAssignedAdminId] = useState<string>('');

    // Data
    const [summary, setSummary] = useState<Summary | null>(null);
    const [volumeTrends, setVolumeTrends] = useState<VolumeTrend[]>([]);
    const [breakdowns, setBreakdowns] = useState<{
        by_branch: BreakdownItem[];
        by_module: BreakdownItem[];
        by_status: BreakdownItem[];
        by_admin: BreakdownItem[];
    } | null>(null);
    const [performance, setPerformance] = useState<{
        avg_first_response_hours: number;
        avg_resolve_time_hours: number;
        longest_open: LongestOpenTicket[];
        stuck_tickets: any[];
    } | null>(null);

    const buildQueryParams = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (branchId) params.append('branch_id', branchId);
        if (moduleId) params.append('module_id', moduleId);
        if (assignedAdminId) params.append('assigned_admin_id', assignedAdminId);
        return params.toString();
    };

    const fetchData = async () => {
        setLoading(true);
        const query = buildQueryParams();

        try {
            if (activeTab === 'summary') {
                const res = await axios.get(`/admin/reports/summary?${query}`);
                setSummary(res.data.data);
            } else if (activeTab === 'volume') {
                const res = await axios.get(`/admin/reports/volume?${query}&granularity=day`);
                setVolumeTrends(res.data.data);
            } else if (activeTab === 'breakdowns') {
                const res = await axios.get(`/admin/reports/breakdowns?${query}`);
                setBreakdowns(res.data.data);
            } else if (activeTab === 'performance') {
                const res = await axios.get(`/admin/reports/performance?${query}`);
                setPerformance(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching report data:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, startDate, endDate, branchId, moduleId, assignedAdminId]);

    const exportCsv = () => {
        const query = buildQueryParams();
        window.open(`/admin/reports/export/csv?${query}`, '_blank');
    };

    const exportSummaryCsv = () => {
        const query = buildQueryParams();
        window.open(`/admin/reports/export/summary-csv?${query}`, '_blank');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Reports & Analytics</h2>}
        >
            <Head title="Reports" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filter Bar */}
                    <GlassCard className="mb-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="input-dark text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="input-dark text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">Branch</label>
                                <select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="select-dark text-sm"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">Module</label>
                                <select
                                    value={moduleId}
                                    onChange={(e) => setModuleId(e.target.value)}
                                    className="select-dark text-sm"
                                >
                                    <option value="">All Modules</option>
                                    {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">Assigned Admin</label>
                                <select
                                    value={assignedAdminId}
                                    onChange={(e) => setAssignedAdminId(e.target.value)}
                                    className="select-dark text-sm"
                                >
                                    <option value="">All Admins</option>
                                    {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={exportCsv}
                                    className="px-3 py-2 bg-green-500/20 text-green-300 dark:text-green-300 light:text-green-700 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-all"
                                >
                                    📥 Export Tickets
                                </button>
                                <button
                                    onClick={exportSummaryCsv}
                                    className="px-3 py-2 bg-blue-500/20 text-blue-300 dark:text-blue-300 light:text-blue-700 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all"
                                >
                                    📊 Export Summary
                                </button>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Tabs */}
                    <GlassCard padding="none">
                        <div className="border-b border-white/10">
                            <nav className="flex -mb-px">
                                {(['summary', 'volume', 'breakdowns', 'performance'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${activeTab === tab
                                            ? 'border-accent-cyan text-accent-cyan'
                                            : 'border-transparent text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900 hover:border-white/30'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {loading && (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-400 light:text-gray-600">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </div>
                                </div>
                            )}

                            {/* Summary Tab */}
                            {activeTab === 'summary' && summary && !loading && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <KPICard title="Created" value={summary.total_created} color="blue" />
                                    <KPICard title="Resolved" value={summary.total_resolved} color="green" />
                                    <KPICard title="Closed" value={summary.total_closed} color="gray" />
                                    <KPICard title="Open" value={summary.current_open} color="yellow" />
                                    <KPICard title="Avg Resolve (hrs)" value={summary.avg_resolve_time_hours} color="purple" />
                                    <KPICard title="Reopen Rate" value={`${summary.reopen_rate_percent}%`} color="red" />
                                </div>
                            )}

                            {/* Volume Tab */}
                            {activeTab === 'volume' && volumeTrends.length > 0 && !loading && (
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={volumeTrends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#9ca3af' }} stroke="rgba(255,255,255,0.2)" />
                                            <YAxis tick={{ fill: '#9ca3af' }} stroke="rgba(255,255,255,0.2)" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                                                labelStyle={{ color: '#9ca3af' }}
                                            />
                                            <Legend wrapperStyle={{ color: '#9ca3af' }} />
                                            <Line type="monotone" dataKey="created" stroke="#6366f1" name="Created" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                                            <Line type="monotone" dataKey="resolved" stroke="#22c55e" name="Resolved" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Breakdowns Tab */}
                            {activeTab === 'breakdowns' && breakdowns && !loading && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <BreakdownChart title="By Branch" data={breakdowns.by_branch} />
                                    <BreakdownChart title="By Module" data={breakdowns.by_module} />
                                    <BreakdownChart title="By Status" data={breakdowns.by_status} />
                                    <BreakdownChart title="By Admin" data={breakdowns.by_admin} />
                                </div>
                            )}

                            {/* Performance Tab */}
                            {activeTab === 'performance' && performance && !loading && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4 max-w-md">
                                        <KPICard title="Avg First Response (hrs)" value={performance.avg_first_response_hours} color="indigo" />
                                        <KPICard title="Avg Resolve Time (hrs)" value={performance.avg_resolve_time_hours} color="purple" />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-3">🔴 Longest Open Tickets (Top 20)</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-white/10 text-left">
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Ticket</th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Branch</th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Module</th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Status</th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Assigned</th>
                                                        <th className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Age (days)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {performance.longest_open.map((ticket) => (
                                                        <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-4 py-3 text-sm font-mono font-medium text-accent-cyan">{ticket.ticket_no}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">{ticket.branch}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">{ticket.module}</td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300 dark:text-gray-300 light:text-gray-700 border border-white/10">{ticket.status.replaceAll('_', ' ')}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">{ticket.assigned_admin}</td>
                                                            <td className="px-4 py-3 text-sm font-bold text-red-400">{ticket.age_days}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// KPI Card Component
function KPICard({ title, value, color }: { title: string; value: number | string; color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300 dark:text-blue-300 light:text-blue-700',
        green: 'bg-green-500/10 border-green-500/30 text-green-300 dark:text-green-300 light:text-green-700',
        yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 dark:text-yellow-300 light:text-yellow-700',
        red: 'bg-red-500/10 border-red-500/30 text-red-300 dark:text-red-300 light:text-red-700',
        purple: 'bg-purple-500/10 border-purple-500/30 text-purple-300 dark:text-purple-300 light:text-purple-700',
        gray: 'bg-gray-500/10 border-gray-500/30 text-gray-300 dark:text-gray-300 light:text-gray-700',
        indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    };

    return (
        <div className={`rounded-xl border p-4 ${colorClasses[color] || colorClasses.gray}`}>
            <p className="text-xs font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    );
}

// Breakdown Chart Component
function BreakdownChart({ title, data }: { title: string; data: BreakdownItem[] }) {
    return (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold text-white dark:text-white light:text-gray-900 mb-3">{title}</h4>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" tick={{ fill: '#9ca3af' }} stroke="rgba(255,255,255,0.2)" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="rgba(255,255,255,0.2)" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
