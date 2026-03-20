import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, User } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: User[];
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
}

interface Props extends PageProps {
    users: PaginatedUsers;
}

export default function Index({ auth, users, flash }: Props) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('superadmin.users.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white leading-tight">User Management</h2>}
        >
            <Head title="User Management" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl backdrop-blur-md shadow-glass animate-fade-in">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-md shadow-glass animate-fade-in">
                            {flash.error}
                        </div>
                    )}

                    <div className="mb-6 flex justify-between items-center">
                        <div className="text-gray-400">Manage all registered accounts</div>
                        <Link
                            href={route('superadmin.users.create')}
                            className="btn-primary flex items-center gap-2"
                        >
                            <span className="text-lg">+</span> Add User
                        </Link>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-black/20">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                                                {user.name}
                                                {user.id === auth.user.id && <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">You</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                        user.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}>
                                                    {user.role.replaceAll('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        href={route('superadmin.users.edit', user.id)}
                                                        className="text-indigo-400 hover:text-white transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {user.id !== auth.user.id && (
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                    Showing {users.from} to {users.to} of {users.total} entries
                                </div>
                                <div className="flex gap-1">
                                    {users.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded text-sm ${link.active
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'text-gray-400 hover:bg-white/10'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
