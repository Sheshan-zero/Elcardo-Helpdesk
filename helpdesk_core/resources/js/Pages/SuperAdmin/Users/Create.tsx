import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'user', // Default value
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('superadmin.users.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white leading-tight">Create User</h2>}
        >
            <Head title="Create User" />

            <div className="py-12 min-h-screen">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('superadmin.users.index')}
                            className="flex items-center gap-2 text-indigo-400 hover:text-white transition-colors group w-max"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            Back to Users
                        </Link>
                    </div>

                    <div className="glass-card p-6 shadow-glass-lg">
                        <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">
                            User Details
                        </h3>
                        <form onSubmit={submit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="input-dark w-full"
                                        placeholder="John Doe"
                                        maxLength={255}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="input-dark w-full"
                                        placeholder="john@example.com"
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="input-dark w-full"
                                    required
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                                {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="input-dark w-full"
                                        placeholder="••••••••"
                                        required
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="input-dark w-full"
                                        placeholder="••••••••"
                                        required
                                    />
                                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-400">{errors.password_confirmation}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-8">
                                <Link
                                    href={route('superadmin.users.index')}
                                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary"
                                >
                                    {processing ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
