import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps, KnowledgeArticle, Module } from '@/types';
import { FormEventHandler } from 'react';

interface Props extends PageProps {
    article: KnowledgeArticle;
    modules: Module[];
}

export default function Edit({ auth, article, modules }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: article.title,
        slug: article.slug,
        module_id: article.module_id?.toString() || '',
        summary: article.summary,
        body: article.body,
        is_published: article.is_published,
        is_featured: article.is_featured,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('superadmin.kb.update', article.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Edit Knowledge Article</h2>}
        >
            <Head title="Edit Article" />

            <div className="py-12 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 animate-fade-in">

                    {/* Header */}
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-1">Edit Article</h3>
                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Managing article: <span className="text-white dark:text-white light:text-gray-900 font-medium">"{article.title}"</span></p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${article.is_published ? 'bg-green-500/20 text-green-300 dark:text-green-300 light:text-green-700 border border-green-500/30' : 'bg-gray-700 text-gray-300 dark:text-gray-300 light:text-gray-700'}`}>
                            {article.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                    </div>

                    <div className="glass-card p-8 border border-white/10 shadow-glass-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <form onSubmit={submit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="input-dark w-full text-lg"
                                    required
                                />
                                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Slug */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                        Slug (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="input-dark w-full text-sm font-mono text-gray-400 dark:text-gray-400 light:text-gray-600"
                                    />
                                    {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug}</p>}
                                </div>

                                {/* Module */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                        Module (optional)
                                    </label>
                                    <select
                                        value={data.module_id}
                                        onChange={(e) => setData('module_id', e.target.value)}
                                        className="select-dark w-full"
                                    >
                                        <option value="">— No specific module —</option>
                                        {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                    Summary *
                                </label>
                                <textarea
                                    value={data.summary}
                                    onChange={(e) => setData('summary', e.target.value)}
                                    className="input-dark w-full"
                                    rows={2}
                                    maxLength={500}
                                    required
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.summary && <p className="text-red-400 text-xs">{errors.summary}</p>}
                                    <span className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 ml-auto">{data.summary.length}/500</span>
                                </div>
                            </div>

                            {/* Body */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                                    Article Content (Markdown) *
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        className="input-dark w-full font-mono text-sm leading-relaxed"
                                        rows={16}
                                        required
                                    />
                                    <div className="absolute top-2 right-2 text-xs text-gray-600 bg-black/20 px-2 py-1 rounded select-none">Markdown Support</div>
                                </div>
                                {errors.body && <p className="text-red-400 text-xs mt-1">{errors.body}</p>}
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={data.is_published}
                                            onChange={(e) => setData('is_published', e.target.checked)}
                                            className="sr-only"
                                            id="is_published"
                                        />
                                        <div className={`w-10 h-6 bg-gray-700 rounded-full shadow-inner transition-colors ${data.is_published ? 'bg-green-500' : ''}`}></div>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.is_published ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 group-hover:text-white dark:text-white light:text-gray-900 transition-colors">Published</span>
                                </label>

                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="sr-only"
                                            id="is_featured"
                                        />
                                        <div className={`w-10 h-6 bg-gray-700 rounded-full shadow-inner transition-colors ${data.is_featured ? 'bg-yellow-500' : ''}`}></div>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.is_featured ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 group-hover:text-white dark:text-white light:text-gray-900 transition-colors">Featured</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-6 border-t border-white/10">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary min-w-[150px]"
                                >
                                    {processing ? 'Saving...' : 'Update Article'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Metadata */}
                    <div className="mt-4 p-4 text-xs text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 flex justify-between px-6">
                        <span>Created: {new Date(article.created_at).toLocaleString()} by {article.creator?.name}</span>
                        <span>Last Updated: {new Date(article.updated_at).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
