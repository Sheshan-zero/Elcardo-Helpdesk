import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, KnowledgeArticle, Module, PaginatedData } from '@/types';
import { useState } from 'react';
import GlassCard from '@/Components/GlassCard';

interface Props extends PageProps {
    articles: PaginatedData<KnowledgeArticle>;
    modules: Module[];
    filters: { module_id?: string; search?: string };
}

export default function Index({ auth, articles, modules, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string) => {
        router.get(route('kb.index'), { ...filters, [key]: value || undefined }, {
            preserveState: true, preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">📚 Help Articles</h2>}
        >
            <Head title="Knowledge Base" />

            <div className="py-6">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Search & Filter */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter('search', search)}
                            placeholder="🔍 Search articles..."
                            className="input-dark flex-1"
                        />
                        <select
                            value={filters.module_id || ''}
                            onChange={(e) => handleFilter('module_id', e.target.value)}
                            className="select-dark"
                        >
                            <option value="">All Topics</option>
                            {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>

                    {/* Featured Banner */}
                    {articles.data.some(a => a.is_featured) && (
                        <GlassCard className="border-accent-cyan/20">
                            <h3 className="text-sm font-semibold text-accent-cyan mb-3">⭐ Featured Articles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {articles.data.filter(a => a.is_featured).slice(0, 3).map(article => (
                                    <Link
                                        key={article.id}
                                        href={route('kb.show', article.slug)}
                                        className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        <h4 className="text-sm font-medium text-white dark:text-white light:text-gray-900">{article.title}</h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1 line-clamp-2">{article.summary}</p>
                                    </Link>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Articles Grid */}
                    {articles.data.length === 0 ? (
                        <GlassCard>
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-1">No articles found</h3>
                                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Try a different search or filter.</p>
                            </div>
                        </GlassCard>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {articles.data.map(article => (
                                <Link
                                    key={article.id}
                                    href={route('kb.show', article.slug)}
                                    className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all border border-white/10 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-sm font-semibold text-white dark:text-white light:text-gray-900 leading-snug group-hover:text-accent-cyan transition-colors">{article.title}</h3>
                                        {article.is_featured && <span className="text-yellow-500 text-xs ml-1">⭐</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-2 line-clamp-3">{article.summary}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        {article.module && (
                                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 dark:text-purple-300 light:text-purple-700 rounded text-xs border border-purple-500/30">
                                                {article.module.name}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600">{article.views_count || 0} views</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {articles.last_page > 1 && (
                        <div className="flex justify-center gap-2">
                            {articles.links.map((link, i) => {
                                const label = link.label
                                    .replace('&laquo;', '«')
                                    .replace('&raquo;', '»');
                                return (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url || link.active}
                                        className={`px-3 py-1 text-sm rounded-lg font-medium transition-all ${link.active
                                                ? 'bg-accent-blue text-white dark:text-white light:text-gray-900 shadow-glow'
                                                : link.url
                                                    ? 'bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-white/10 hover:text-white dark:text-white light:text-gray-900'
                                                    : 'text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
