import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, Branch } from '@/types';
import { useState } from 'react';
import GlassCard from '@/Components/GlassCard';

interface Props extends PageProps {
    branches: Branch[];
}

export default function Index({ auth, branches, flash }: Props) {
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        is_head_office: false,
    });

    const openCreateModal = () => {
        reset();
        setEditingBranch(null);
        setShowModal(true);
    };

    const openEditModal = (branch: Branch) => {
        setData({
            name: branch.name,
            code: branch.code || '',
            is_head_office: branch.is_head_office,
        });
        setEditingBranch(branch);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBranch(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBranch) {
            put(route('superadmin.branches.update', editingBranch.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('superadmin.branches.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleToggle = (branch: Branch) => {
        router.patch(route('superadmin.branches.toggle', branch.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Branch Management</h2>}
        >
            <Head title="Branch Management" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl backdrop-blur-md shadow-glass animate-fade-in">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-6 flex justify-between items-center">
                        <a
                            href={route('superadmin.modules.index')}
                            className="flex items-center gap-2 text-indigo-400 hover:text-white dark:text-white light:text-gray-900 transition-colors group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            Manage Modules
                        </a>
                        <button
                            onClick={openCreateModal}
                            className="btn-primary flex items-center gap-2"
                        >
                            <span className="text-lg">+</span> Add Branch
                        </button>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {branches.map((branch) => (
                                    <tr key={branch.id} className={`hover:bg-white/5 transition-colors ${!branch.is_active ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-white dark:text-white light:text-gray-900">
                                            {branch.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 font-mono">
                                            {branch.code || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {branch.is_head_office ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 dark:text-purple-400 light:text-purple-600 border border-purple-500/20">
                                                    HEAD OFFICE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 border border-white/10">
                                                    BRANCH
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${branch.is_active
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {branch.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => openEditModal(branch)}
                                                    className="text-indigo-400 hover:text-white dark:text-white light:text-gray-900 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(branch)}
                                                    className={branch.is_active ? 'text-red-400 hover:text-red-300 dark:text-red-300 light:text-red-700' : 'text-green-400 hover:text-green-300 dark:text-green-300 light:text-green-700'}
                                                >
                                                    {branch.is_active ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 m-4 shadow-glass-lg scale-100 animate-slide-up">
                        <h3 className="text-xl font-bold mb-6 text-white dark:text-white light:text-gray-900 border-b border-white/10 pb-4">
                            {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="input-dark w-full"
                                    placeholder="e.g. Main Branch"
                                    maxLength={255}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Code (Optional)</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="input-dark w-full font-mono"
                                    placeholder="e.g. BR-001"
                                    maxLength={10}
                                />
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <input
                                    type="checkbox"
                                    id="is_head_office"
                                    checked={data.is_head_office}
                                    onChange={(e) => setData('is_head_office', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                                />
                                <label htmlFor="is_head_office" className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 cursor-pointer select-none">
                                    Set as Head Office
                                </label>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary"
                                >
                                    {processing ? 'Saving...' : 'Save Branch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
