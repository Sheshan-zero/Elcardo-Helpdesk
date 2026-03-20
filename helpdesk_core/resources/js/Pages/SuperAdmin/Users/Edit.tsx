import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, User } from '@/types';

interface Props extends PageProps {
    user: User;
}

export default function Edit({ auth, user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('superadmin.users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white leading-tight">Edit User #{user.id}</h2>}
        >
            <Head title={`Edit User: ${user.name}`} />

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
                                    onChange={(e) => setData('role', e.target.value as "user" | "super_admin" | "admin")}
                                    className="input-dark w-full"
                                    required
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                                {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role}</p>}
                            </div>

                            <hr className="border-white/10 my-8 shadow-sm" />
                            <h4 className="text-lg font-bold mb-4 text-gray-300">Change Password (Optional)</h4>
                            <p className="text-sm text-gray-500 mb-6">Leave blank if you do not wish to change the password.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="input-dark w-full"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="input-dark w-full"
                                        placeholder="••••••••"
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
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
