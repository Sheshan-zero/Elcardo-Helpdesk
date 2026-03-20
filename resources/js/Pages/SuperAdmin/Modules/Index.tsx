import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, Module } from '@/types';
import { useState } from 'react';

interface Props extends PageProps {
    modules: Module[];
}

export default function Index({ auth, modules, flash }: Props) {
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingModule(null);
        setShowModal(true);
    };

    const openEditModal = (module: Module) => {
        setData({
            name: module.name,
            description: module.description || '',
        });
        setEditingModule(module);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingModule(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingModule) {
            put(route('superadmin.modules.update', editingModule.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('superadmin.modules.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleToggle = (module: Module) => {
        router.patch(route('superadmin.modules.toggle', module.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Module Management</h2>}
        >
            <Head title="Module Management" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl backdrop-blur-md shadow-glass animate-fade-in">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-6 flex justify-between items-center">
                        <a
                            href={route('superadmin.branches.index')}
                            className="flex items-center gap-2 text-indigo-400 hover:text-white dark:text-white light:text-gray-900 transition-colors group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            Manage Branches
                        </a>
                        <button
                            onClick={openCreateModal}
                            className="btn-primary flex items-center gap-2"
                        >
                            <span className="text-lg">+</span> Add Module
                        </button>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {modules.map((module) => (
                                    <tr key={module.id} className={`hover:bg-white/5 transition-colors ${!module.is_active ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-white dark:text-white light:text-gray-900">
                                            {module.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-sm truncate">
                                            {module.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${module.is_active
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {module.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => openEditModal(module)}
                                                    className="text-indigo-400 hover:text-white dark:text-white light:text-gray-900 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(module)}
                                                    className={module.is_active ? 'text-red-400 hover:text-red-300 dark:text-red-300 light:text-red-700' : 'text-green-400 hover:text-green-300 dark:text-green-300 light:text-green-700'}
                                                >
                                                    {module.is_active ? 'Disable' : 'Enable'}
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
                            {editingModule ? 'Edit Module' : 'Add New Module'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="input-dark w-full"
                                    placeholder="e.g. Hardware Support"
                                    maxLength={255}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="textarea-dark w-full"
                                    placeholder="Brief description of this module..."
                                />
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
                                    {processing ? 'Saving...' : 'Save Module'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
