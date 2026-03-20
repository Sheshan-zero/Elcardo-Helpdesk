import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import axios from 'axios';

interface Branch {
    id: number;
    name: string;
}

interface Props extends PageProps {
    settings: {
        refresh_interval: number;
        visible_columns: string[];
        show_admin_name: boolean;
        user_display: string;
        show_remote_badges: boolean;
        warn_hours: number;
        critical_hours: number;
        branch_filter: number | null;
        signed_link_days: number;
    };
    branches: Branch[];
    allStatuses: string[];
}

export default function WallboardSettings({ auth, settings, branches, allStatuses }: Props) {
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [linkExpiry, setLinkExpiry] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    const { data, setData, put, processing } = useForm({
        refresh_interval: settings.refresh_interval,
        visible_columns: settings.visible_columns,
        show_admin_name: settings.show_admin_name,
        user_display: settings.user_display,
        show_remote_badges: settings.show_remote_badges,
        warn_hours: settings.warn_hours,
        critical_hours: settings.critical_hours,
        branch_filter: settings.branch_filter,
        signed_link_days: settings.signed_link_days,
    });

    const handleColumnToggle = (status: string) => {
        const newColumns = data.visible_columns.includes(status)
            ? data.visible_columns.filter(s => s !== status)
            : [...data.visible_columns, status];
        setData('visible_columns', newColumns);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('superadmin.wallboard.update'));
    };

    const generateLink = async () => {
        setGenerating(true);
        try {
            const response = await axios.post(route('superadmin.wallboard.signedLink'));

            if (response.data.url) {
                setGeneratedLink(response.data.url);
                setLinkExpiry(new Date(response.data.expires_at).toLocaleDateString());
            } else {
                alert('Failed to generate link.');
            }
        } catch (err) {
            console.error('Error generating link:', err);
            alert('Error generating link. Check console for details.');
        }
        setGenerating(false);
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Wallboard Settings</h2>}
        >
            <Head title="Wallboard Settings" />

            <div className="py-12 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8 animate-fade-in">

                    {/* Header */}
                    <div>
                        <h3 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-2">Wallboard Configuration</h3>
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">Manage display settings and access for the TV wallboard.</p>
                    </div>

                    {/* Generate Link Section */}
                    <div className="glass-card p-8 animate-slide-up border border-indigo-500/20 shadow-glass-lg">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                            <span className="text-3xl">📺</span>
                            <div>
                                <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900">TV Wallboard Link</h3>
                                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Generate a secure, temporary link for display screens (no login required).</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <button
                                onClick={generateLink}
                                disabled={generating}
                                className="btn-primary"
                            >
                                {generating ? 'Generating...' : 'Generate New Link'}
                            </button>
                            <span className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                Expires in <strong className="text-white dark:text-white light:text-gray-900">{data.signed_link_days} days</strong> (configurable below)
                            </span>
                        </div>

                        {generatedLink && (
                            <div className="mt-6 p-5 bg-black/40 rounded-xl border border-indigo-500/30 animate-fade-in">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wider">Signed URL</span>
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-sm text-indigo-400 hover:text-white dark:text-white light:text-gray-900 font-bold transition-colors flex items-center gap-1"
                                    >
                                        <span>📋</span> Copy Link
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={generatedLink}
                                        className="w-full text-sm bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-300 dark:text-gray-300 light:text-gray-700 font-mono focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 mt-3 text-right">Valid until: {linkExpiry}</p>
                            </div>
                        )}
                    </div>

                    {/* Settings Form */}
                    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8 border border-white/10">
                        <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900 flex items-center gap-2 pb-4 border-b border-white/10">
                            <span>⚙️</span> Display Settings
                        </h3>

                        {/* Visible Columns */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-3 uppercase tracking-wider">
                                Visible Columns
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allStatuses.map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => handleColumnToggle(status)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 border ${data.visible_columns.includes(status)
                                            ? 'bg-indigo-600 text-white dark:text-white light:text-gray-900 border-indigo-500 shadow-lg shadow-indigo-600/20'
                                            : 'bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        {status.replaceAll('_', ' ')}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 mt-2">Select which ticket statuses to display as columns on the wallboard.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Refresh Interval */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                    Auto-Refresh Interval
                                </label>
                                <select
                                    value={data.refresh_interval}
                                    onChange={(e) => setData('refresh_interval', parseInt(e.target.value))}
                                    className="select-dark w-full"
                                >
                                    <option value={10}>10 seconds</option>
                                    <option value={20}>20 seconds</option>
                                    <option value={30}>30 seconds</option>
                                    <option value={60}>60 seconds</option>
                                </select>
                            </div>

                            {/* Branch Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                    Global Branch Filter
                                </label>
                                <select
                                    value={data.branch_filter || ''}
                                    onChange={(e) => setData('branch_filter', e.target.value ? parseInt(e.target.value) : null)}
                                    className="select-dark w-full"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Privacy Settings */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                    User Display Format
                                </label>
                                <select
                                    value={data.user_display}
                                    onChange={(e) => setData('user_display', e.target.value)}
                                    className="select-dark w-full"
                                >
                                    <option value="none">Hidden</option>
                                    <option value="initials">Initials Only (K. Silva)</option>
                                    <option value="full">Full Name</option>
                                </select>
                            </div>

                            {/* Link Expiry */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                    Link Validity Duration (days)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={data.signed_link_days}
                                    onChange={(e) => setData('signed_link_days', parseInt(e.target.value))}
                                    className="input-dark w-full"
                                />
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-5 rounded-xl border border-white/5">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={data.show_admin_name}
                                        onChange={(e) => setData('show_admin_name', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 bg-gray-700 rounded-full shadow-inner transition-colors ${data.show_admin_name ? 'bg-indigo-600' : ''}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.show_admin_name ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 group-hover:text-white dark:text-white light:text-gray-900 transition-colors">Show Assigned Admin Name</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={data.show_remote_badges}
                                        onChange={(e) => setData('show_remote_badges', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 bg-gray-700 rounded-full shadow-inner transition-colors ${data.show_remote_badges ? 'bg-indigo-600' : ''}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.show_remote_badges ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 group-hover:text-white dark:text-white light:text-gray-900 transition-colors">Show Remote Badges</span>
                            </label>
                        </div>

                        {/* Aging Thresholds */}
                        <div className="border-t border-white/10 pt-6">
                            <h4 className="text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider mb-4">Color Coding Thresholds</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-orange-400 mb-2">
                                        Warning Color (Orange) After:
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="168"
                                            value={data.warn_hours}
                                            onChange={(e) => setData('warn_hours', parseInt(e.target.value))}
                                            className="input-dark w-full pr-16 border-orange-500/30 focus:border-orange-500"
                                        />
                                        <span className="absolute right-4 top-2.5 text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">hours</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-red-400 mb-2">
                                        Critical Color (Red) After:
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="336"
                                            value={data.critical_hours}
                                            onChange={(e) => setData('critical_hours', parseInt(e.target.value))}
                                            className="input-dark w-full pr-16 border-red-500/30 focus:border-red-500"
                                        />
                                        <span className="absolute right-4 top-2.5 text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary min-w-[150px]"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
