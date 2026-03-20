import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface EmailTemplate {
    id: number;
    key: string;
    subject: string;
    body: string;
    is_html: boolean;
}

interface Props extends PageProps {
    templates: EmailTemplate[];
    sampleVariables: Record<string, string>;
}

export default function EmailTemplates({ auth, templates, sampleVariables }: Props) {
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [previewKey, setPreviewKey] = useState<string | null>(null);

    const { data, setData, put, processing, reset } = useForm({
        subject: '',
        body: '',
    });

    const startEditing = (template: EmailTemplate) => {
        setEditingKey(template.key);
        setData({
            subject: template.subject,
            body: template.body,
        });
    };

    const cancelEditing = () => {
        setEditingKey(null);
        reset();
    };

    const saveTemplate = (key: string) => {
        put(route('superadmin.templates.update', key), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingKey(null);
            },
        });
    };

    const renderPreview = (template: EmailTemplate) => {
        let preview = template.body;
        Object.entries(sampleVariables).forEach(([key, value]) => {
            preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        });
        return preview;
    };

    const getTemplateLabel = (key: string) => {
        const labels: Record<string, string> = {
            ticket_received: 'Ticket Received',
            ticket_assigned: 'Ticket Assigned',
            ticket_in_progress: 'Ticket In Progress',
            ticket_resolved: 'Ticket Resolved',
            ticket_closed: 'Ticket Closed',
        };
        return labels[key] || key;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Email Templates</h2>}
        >
            <Head title="Email Templates" />

            <div className="py-12 min-h-screen">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">

                    {/* Variables Reference Card */}
                    <div className="glass-card p-6 mb-8 animate-fade-in">
                        <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-indigo-400">{'{}'}</span> Available Variables
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {Object.keys(sampleVariables).map((varName) => (
                                <code key={varName} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-mono tracking-wide">
                                    {`{{${varName}}}`}
                                </code>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6 stagger-animation">
                        {templates.map((template) => (
                            <div key={template.id} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-glass-lg border border-white/5">
                                <div className="px-6 py-5 bg-black/20 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900">{getTemplateLabel(template.key)}</h3>
                                    <div className="flex gap-3">
                                        {previewKey === template.key ? (
                                            <button
                                                onClick={() => setPreviewKey(null)}
                                                className="text-sm px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900 transition-colors"
                                            >
                                                Hide Preview
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setPreviewKey(template.key)}
                                                className="text-sm px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                                            >
                                                Preview
                                            </button>
                                        )}
                                        {editingKey === template.key ? (
                                            <>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="text-sm px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => saveTemplate(template.key)}
                                                    disabled={processing}
                                                    className="text-sm px-4 py-1.5 rounded-lg bg-green-500 text-white dark:text-white light:text-gray-900 font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                                >
                                                    Save Changes
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => startEditing(template)}
                                                className="text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white dark:text-white light:text-gray-900 font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                                            >
                                                Edit Template
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {editingKey === template.key ? (
                                        <div className="space-y-5 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2 uppercase tracking-wider">Subject Line</label>
                                                <input
                                                    type="text"
                                                    value={data.subject}
                                                    onChange={(e) => setData('subject', e.target.value)}
                                                    className="input-dark w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2 uppercase tracking-wider">Email Body</label>
                                                <textarea
                                                    value={data.body}
                                                    onChange={(e) => setData('body', e.target.value)}
                                                    rows={12}
                                                    className="textarea-dark w-full font-mono text-sm leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    ) : previewKey === template.key ? (
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 animate-fade-in">
                                            <div className="mb-4 pb-4 border-b border-white/10">
                                                <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                                                    <span className="font-bold text-white dark:text-white light:text-gray-900 uppercase tracking-wider mr-2">Subject:</span>
                                                    {template.subject.replace(/\{\{(\w+)\}\}/g, (_, k) => sampleVariables[k] || `{{${k}}}`)}
                                                </p>
                                            </div>
                                            <div className="prose prose-invert max-w-none">
                                                <pre className="whitespace-pre-wrap text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 font-mono bg-black/30 p-4 rounded-lg border border-white/5">
                                                    {renderPreview(template)}
                                                </pre>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                                                    <span className="font-bold text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider mr-2">Subject:</span> {template.subject}
                                                </p>
                                            </div>
                                            <pre className="whitespace-pre-wrap text-sm text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 font-mono bg-black/20 p-4 rounded-lg border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                                                {template.body}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
