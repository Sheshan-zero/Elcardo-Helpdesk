import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Branch { id: number; name: string; }
interface Module { id: number; name: string; }

interface Policy {
    id: number;
    name: string;
    applies_to_branch_id: number | null;
    applies_to_module_id: number | null;
    priority: string | null;
    first_response_minutes: number | null;
    resolution_minutes: number | null;
    is_active: boolean;
    branch?: Branch | null;
    module?: Module | null;
}

interface Props extends PageProps {
    policies: Policy[];
    branches: Branch[];
    modules: Module[];
    priorities: string[];
}

function formatMinutes(mins: number | null): string {
    if (!mins) return '—';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function SlaPolicies({ auth, policies, branches, modules, priorities }: Props) {
    const [editing, setEditing] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        name: '',
        applies_to_branch_id: '' as string,
        applies_to_module_id: '' as string,
        priority: '' as string,
        first_response_minutes: '' as string,
        resolution_minutes: '' as string,
        is_active: true,
    });

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        setEditing(null);
        setShowForm(false);
    };

    const editPolicy = (p: Policy) => {
        form.setData({
            name: p.name,
            applies_to_branch_id: p.applies_to_branch_id?.toString() || '',
            applies_to_module_id: p.applies_to_module_id?.toString() || '',
            priority: p.priority || '',
            first_response_minutes: p.first_response_minutes?.toString() || '',
            resolution_minutes: p.resolution_minutes?.toString() || '',
            is_active: p.is_active,
        });
        setEditing(p.id);
        setShowForm(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form.data,
            applies_to_branch_id: form.data.applies_to_branch_id || null,
            applies_to_module_id: form.data.applies_to_module_id || null,
            priority: form.data.priority || null,
            first_response_minutes: form.data.first_response_minutes ? parseInt(form.data.first_response_minutes) : null,
            resolution_minutes: form.data.resolution_minutes ? parseInt(form.data.resolution_minutes) : null,
        };

        if (editing) {
            router.put(route('superadmin.sla.update', editing), data, {
                onSuccess: () => resetForm(),
                preserveScroll: true,
            });
        } else {
            router.post(route('superadmin.sla.store'), data, {
                onSuccess: () => resetForm(),
                preserveScroll: true,
            });
        }
    };

    const deletePolicy = (id: number) => {
        if (confirm('Delete this SLA policy?')) {
            router.delete(route('superadmin.sla.destroy', id), { preserveScroll: true });
        }
    };

    const backfill = () => {
        if (confirm('Apply SLA due dates to all existing open tickets?')) {
            router.post(route('superadmin.sla.backfill'), {}, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">SLA Policies</h2>}
        >
            <Head title="SLA Policies" />

            <div className="py-12 min-h-screen">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* Header & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                        <div>
                            <h3 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-1">Service Level Agreements</h3>
                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Define response and resolution times based on ticket criteria.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={backfill}
                                className="btn-secondary flex items-center gap-2 text-sm"
                            >
                                <span className="text-lg">♻️</span> Backfill Existing Tickets
                            </button>
                            <button
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="btn-primary flex items-center gap-2"
                            >
                                <span className="text-lg">+</span> New Policy
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <div className="glass-card p-6 animate-slide-up border border-indigo-500/30 shadow-glass-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-6 border-b border-white/10 pb-2">
                                {editing ? 'Edit' : 'Create New'} Policy
                            </h3>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Policy Name *</label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)}
                                            className="input-dark w-full"
                                            placeholder="e.g. Default SLA, Urgent Priority SLA"
                                            required
                                        />
                                        {form.errors.name && <p className="text-red-400 text-xs mt-1">{form.errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Priority Scope</label>
                                        <select
                                            value={form.data.priority}
                                            onChange={e => form.setData('priority', e.target.value)}
                                            className="select-dark w-full"
                                        >
                                            <option value="">All Priorities</option>
                                            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Branch Scope</label>
                                        <select
                                            value={form.data.applies_to_branch_id}
                                            onChange={e => form.setData('applies_to_branch_id', e.target.value)}
                                            className="select-dark w-full"
                                        >
                                            <option value="">All Branches</option>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Module Scope</label>
                                        <select
                                            value={form.data.applies_to_module_id}
                                            onChange={e => form.setData('applies_to_module_id', e.target.value)}
                                            className="select-dark w-full"
                                        >
                                            <option value="">All Modules</option>
                                            {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">First Response (minutes)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={form.data.first_response_minutes}
                                                onChange={e => form.setData('first_response_minutes', e.target.value)}
                                                className="input-dark w-full pr-12"
                                                placeholder="e.g. 60"
                                                min="1"
                                            />
                                            <span className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">min</span>
                                        </div>
                                        {form.errors.first_response_minutes && <p className="text-red-400 text-xs mt-1">{form.errors.first_response_minutes}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Resolution (minutes)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={form.data.resolution_minutes}
                                                onChange={e => form.setData('resolution_minutes', e.target.value)}
                                                className="input-dark w-full pr-12"
                                                placeholder="e.g. 2880"
                                                min="1"
                                            />
                                            <span className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={e => form.setData('is_active', e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-offset-gray-900"
                                        id="is_active"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700">Policy is Active</label>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-white/10">
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="btn-primary min-w-[120px]"
                                    >
                                        {editing ? 'Update Policy' : 'Create Policy'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-2 rounded-xl border border-white/10 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900 hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Policies Table */}
                    <div className="glass-card overflow-hidden">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Scope Criteria</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">1st Response</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Resolution</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {policies.length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600">No SLA policies defined yet.</td></tr>
                                )}
                                {policies.map(p => (
                                    <tr key={p.id} className={`hover:bg-white/5 transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white dark:text-white light:text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                                            <div className="flex flex-wrap gap-2">
                                                {p.branch && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 dark:text-blue-300 light:text-blue-700 border border-blue-500/30 rounded text-xs">{p.branch.name}</span>}
                                                {p.module && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 dark:text-purple-300 light:text-purple-700 border border-purple-500/30 rounded text-xs">{p.module.name}</span>}
                                                {p.priority && <span className={`px-2 py-0.5 rounded text-xs border ${p.priority === 'Critical' ? 'bg-red-500/20 text-red-300 dark:text-red-300 light:text-red-700 border-red-500/30' :
                                                    p.priority === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                                        'bg-green-500/20 text-green-300 dark:text-green-300 light:text-green-700 border-green-500/30'
                                                    }`}>{p.priority}</span>}
                                                {!p.branch && !p.module && !p.priority && <span className="text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs italic">Global Default</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 font-mono">{formatMinutes(p.first_response_minutes)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 font-mono">{formatMinutes(p.resolution_minutes)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${p.is_active
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-gray-700 text-gray-400 dark:text-gray-400 light:text-gray-600 border-gray-600'
                                                }`}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                                            <button onClick={() => editPolicy(p)} className="text-indigo-400 hover:text-white dark:text-white light:text-gray-900 transition-colors text-xs uppercase font-bold tracking-wide">Edit</button>
                                            <button onClick={() => deletePolicy(p.id)} className="text-red-400 hover:text-red-300 dark:text-red-300 light:text-red-700 transition-colors text-xs uppercase font-bold tracking-wide">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-sm text-blue-300 dark:text-blue-300 light:text-blue-700 flex items-start gap-3">
                        <span className="text-xl">ℹ️</span>
                        <div>
                            <strong className="block mb-1 text-blue-200 dark:text-blue-200 light:text-blue-800">How SLA matching works:</strong>
                            The most specific policy wins. A policy matching <span className="text-white dark:text-white light:text-gray-900 bg-blue-500/20 px-1 rounded">branch + module + priority</span> takes precedence over one matching only <span className="text-white dark:text-white light:text-gray-900 bg-blue-500/20 px-1 rounded">priority</span>.
                            Policies with empty scope fields act as wildcards.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
