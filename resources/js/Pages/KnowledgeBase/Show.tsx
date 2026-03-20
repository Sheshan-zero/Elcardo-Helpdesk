import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, KnowledgeArticle } from '@/types';
import GlassCard from '@/Components/GlassCard';

interface Props extends PageProps {
    article: KnowledgeArticle;
    related: Pick<KnowledgeArticle, 'id' | 'title' | 'slug' | 'summary'>[];
}

/**
 * Simple markdown-like renderer for basic formatting
 */
function renderMarkdown(text: string) {
    return text
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-white dark:text-white light:text-gray-900">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2 text-white dark:text-white light:text-gray-900">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-white dark:text-white light:text-gray-900">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white dark:text-white light:text-gray-900">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm text-accent-cyan border border-white/10">$1</code>')
        .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');
}

export default function Show({ auth, article, related }: Props) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <Link href={route('kb.index')} className="text-accent-cyan hover:text-accent-blue text-sm transition-colors">
                        ← Back to Articles
                    </Link>
                </div>
            }
        >
            <Head title={article.title} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <GlassCard>
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">{article.title}</h1>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                                {article.module && (
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 dark:text-purple-300 light:text-purple-700 rounded border border-purple-500/30">
                                        {article.module.name}
                                    </span>
                                )}
                                <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
                                {article.creator && <span>by {article.creator.name}</span>}
                            </div>
                            <p className="text-gray-300 dark:text-gray-300 light:text-gray-700 mt-3">{article.summary}</p>
                        </div>

                        <hr className="border-white/10 mb-6" />

                        {/* Body */}
                        <div
                            className="prose prose-sm max-w-none text-gray-300 dark:text-gray-300 light:text-gray-700 leading-relaxed prose-invert"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }}
                        />
                    </GlassCard>

                    {/* Related Articles */}
                    {related.length > 0 && (
                        <GlassCard className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-700 mb-3">Related Articles</h3>
                            <div className="space-y-2">
                                {related.map(r => (
                                    <Link
                                        key={r.id}
                                        href={route('kb.show', r.slug)}
                                        className="block bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                                    >
                                        <h4 className="text-sm font-medium text-accent-cyan">{r.title}</h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">{r.summary.substring(0, 100)}...</p>
                                    </Link>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Still need help? */}
                    <GlassCard className="mt-6 border-accent-blue/20 text-center">
                        <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 mb-3">Didn't find what you need?</p>
                        <Link
                            href={route('tickets.create')}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            Submit a Support Ticket
                        </Link>
                    </GlassCard>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
