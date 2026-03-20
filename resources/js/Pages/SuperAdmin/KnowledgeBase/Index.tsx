import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, KnowledgeArticle, Module, PaginatedData } from '@/types';
import { useState } from 'react';

interface Props extends PageProps {
    articles: PaginatedData<KnowledgeArticle>;
    modules: Module[];
    filters: {
        module_id?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, articles, modules, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string) => {
        router.get(route('superadmin.kb.index'), {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const togglePublished = (article: KnowledgeArticle) => {
        router.patch(route('superadmin.kb.togglePublished', article.id), {}, {
            preserveScroll: true,
        });
    };

    const toggleFeatured = (article: KnowledgeArticle) => {
        router.patch(route('superadmin.kb.toggleFeatured', article.id), {}, {
            preserveScroll: true,
        });
    };

    const deleteArticle = (article: KnowledgeArticle) => {
        if (confirm(`Delete "${article.title}"?`)) {
            router.delete(route('superadmin.kb.destroy', article.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Knowledge Base</h2>}
        >
            <Head title="Knowledge Base" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8 animate-fade-in">
                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-1">Knowledge Base Management</h3>
                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Create and manage help articles for users.</p>
                        </div>

                        <Link
                            href={route('superadmin.kb.create')}
                            className="btn-primary flex items-center gap-2"
                        >
                            <span className="text-lg">+</span> Create Article
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/10">
                        <div className="relative w-full md:w-96">
                            <span className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-400 light:text-gray-600">🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter('search', search)}
                                placeholder="Search articles..."
                                className="input-dark w-full pl-10"
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <select
                                value={filters.module_id || ''}
                                onChange={(e) => handleFilter('module_id', e.target.value)}
                                className="select-dark w-full md:w-48"
                            >
                                <option value="">All Modules</option>
                                {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilter('status', e.target.value)}
                                className="select-dark w-full md:w-40"
                            >
                                <option value="">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Articles Table */}
                    <div className="glass-card overflow-hidden border border-white/10">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Module</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Views</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {articles.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600">
                                            No articles found. Create your first knowledge base article!
                                        </td>
                                    </tr>
                                )}
                                {articles.data.map(article => (
                                    <tr key={article.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('superadmin.kb.edit', article.id)}
                                                        className="text-sm font-bold text-white dark:text-white light:text-gray-900 hover:text-indigo-400 transition-colors"
                                                    >
                                                        {article.title}
                                                    </Link>
                                                    {article.is_featured && (
                                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-300 dark:text-yellow-300 light:text-yellow-700 border border-yellow-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1 line-clamp-1 group-hover:text-gray-300 dark:text-gray-300 light:text-gray-700 transition-colors">
                                                    {article.summary}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                                            {article.module ? (
                                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 dark:text-purple-300 light:text-purple-700 border border-purple-500/30 rounded text-xs">
                                                    {article.module.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-600 text-xs italic">— General —</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 font-mono">
                                            {article.views_count || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs font-medium border ${article.is_published
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-gray-700/50 text-gray-400 dark:text-gray-400 light:text-gray-600 border-gray-600'
                                                    }`}
                                            >
                                                {article.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm space-x-3">
                                            <Link
                                                href={route('superadmin.kb.edit', article.id)}
                                                className="text-indigo-400 hover:text-white dark:text-white light:text-gray-900 transition-colors text-xs uppercase font-bold tracking-wide"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => togglePublished(article)}
                                                className={`text-xs uppercase font-bold tracking-wide transition-colors ${article.is_published ? 'text-amber-400 hover:text-amber-200' : 'text-green-400 hover:text-green-200 dark:text-green-200 light:text-green-800'}`}
                                            >
                                                {article.is_published ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => toggleFeatured(article)}
                                                className={`text-xs uppercase font-bold tracking-wide transition-colors ${article.is_featured ? 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900' : 'text-yellow-400 hover:text-yellow-200'}`}
                                            >
                                                {article.is_featured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                onClick={() => deleteArticle(article)}
                                                className="text-red-400 hover:text-red-300 dark:text-red-300 light:text-red-700 transition-colors text-xs uppercase font-bold tracking-wide"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {articles.last_page > 1 && (
                        <div className="flex justify-center gap-2">
                            {articles.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-4 py-2 text-sm rounded-lg border transition-all ${link.active
                                        ? 'bg-indigo-600 border-indigo-500 text-white dark:text-white light:text-gray-900 shadow-lg shadow-indigo-600/20'
                                        : 'bg-white/5 border-white/10 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-white/10 hover:text-white dark:text-white light:text-gray-900'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
