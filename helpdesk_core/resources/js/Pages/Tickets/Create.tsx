import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps, Branch, Module } from '@/types';
import { FormEventHandler, useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '@/Components/GlassCard';

interface Props extends PageProps {
    branches: Pick<Branch, 'id' | 'name' | 'is_head_office'>[];
    modules: Pick<Module, 'id' | 'name'>[];
}

export default function Create({ auth, branches, modules }: Props) {
    const [selectedBranch, setSelectedBranch] = useState<Pick<Branch, 'id' | 'name' | 'is_head_office'> | null>(null);
    const [kbSuggestions, setKbSuggestions] = useState<{ id: number; title: string; slug: string; summary: string }[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        branch_id: '',
        module_id: '',
        phone: '',
        issue_description: '',
        ip_address: '',
        anydesk_code: '',
        priority: 'MEDIUM',
        attachments: [] as File[],
    });

    useEffect(() => {
        if (data.branch_id) {
            const branch = branches.find(b => b.id.toString() === data.branch_id);
            setSelectedBranch(branch || null);
        } else {
            setSelectedBranch(null);
        }
    }, [data.branch_id, branches]);

    // Fetch KB suggestions when module changes
    useEffect(() => {
        if (data.module_id) {
            axios.get(route('kb.suggestions'), { params: { module_id: data.module_id } })
                .then(res => setKbSuggestions(res.data))
                .catch(() => setKbSuggestions([]));
        } else {
            setKbSuggestions([]);
        }
    }, [data.module_id]);

    const isHeadOffice = selectedBranch?.is_head_office || false;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('attachments', Array.from(e.target.files));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('tickets.store'), {
            forceFormData: true,
            onError: (errors) => {
                console.error('Form errors:', errors);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="New Ticket"
        >
            <Head title="Submit Ticket" />

            <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-0">
                <GlassCard className="p-4 sm:p-6 md:p-8">
                    <div className="mb-6 border-b border-white/10 pb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-white dark:text-white light:text-gray-900">Describe Your Issue</h2>
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs sm:text-sm mt-1">Please provide as much detail as possible so we can assist you quickly.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Branch Selection */}
                            <div>
                                <label htmlFor="branch_id" className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
                                    Branch <span className="text-red-400">*</span>
                                </label>
                                <select
                                    id="branch_id"
                                    value={data.branch_id}
                                    onChange={(e) => setData('branch_id', e.target.value)}
                                    className="select-dark w-full text-sm sm:text-base"
                                    required
                                >
                                    <option value="" disabled>Select a branch</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.branch_id && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.branch_id}</p>
                                )}
                            </div>

                            {/* Module Selection */}
                            <div>
                                <label htmlFor="module_id" className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
                                    Module <span className="text-red-400">*</span>
                                </label>
                                <select
                                    id="module_id"
                                    value={data.module_id}
                                    onChange={(e) => setData('module_id', e.target.value)}
                                    className="select-dark w-full text-sm sm:text-base"
                                    required
                                >
                                    <option value="" disabled>Select a module</option>
                                    {modules.map((module) => (
                                        <option key={module.id} value={module.id}>
                                            {module.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.module_id && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.module_id}</p>
                                )}
                            </div>
                        </div>

                        {/* KB Suggestions */}
                        {kbSuggestions.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 animate-fade-in">
                                <h4 className="text-sm font-medium text-blue-300 dark:text-blue-300 light:text-blue-700 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Suggested Articles</span>
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {kbSuggestions.map(article => (
                                        <a
                                            key={article.id}
                                            href={route('kb.show', article.slug)}
                                            target="_blank"
                                            className="block bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all group"
                                        >
                                            <span className="text-sm font-medium text-blue-200 dark:text-blue-200 light:text-blue-800 group-hover:text-blue-100">{article.title}</span>
                                            <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1 line-clamp-2">{article.summary}</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
                                    Phone Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="input-dark w-full text-sm sm:text-base"
                                    placeholder="+94 XX XXX XXXX"
                                    maxLength={20}
                                    required
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.phone}</p>
                                )}
                            </div>

                            {/* Priority Selection */}
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    className="select-dark w-full text-sm sm:text-base"
                                >
                                    <option value="LOW">Low - Minor issues</option>
                                    <option value="MEDIUM">Medium - Standard priority</option>
                                    <option value="HIGH">High - Important</option>
                                    <option value="URGENT">Urgent - Critical</option>
                                </select>
                                {errors.priority && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.priority}</p>
                                )}
                            </div>
                        </div>

                        {/* Issue Description */}
                        <div>
                            <label htmlFor="issue_description" className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
                                Issue Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                id="issue_description"
                                rows={5}
                                value={data.issue_description}
                                onChange={(e) => setData('issue_description', e.target.value)}
                                className="textarea-dark w-full text-sm sm:text-base"
                                placeholder="Please describe your issue in detail..."
                                minLength={10}
                                required
                            />
                            {errors.issue_description && (
                                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.issue_description}</p>
                            )}
                        </div>

                        {/* Remote Access Section */}
                        {selectedBranch && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 mt-4">
                                <h3 className="text-sm font-medium text-gray-200 dark:text-gray-200 light:text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 text-gray-400 dark:text-gray-400 light:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>Remote Access Information</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* IP Address - Only for Head Office */}
                                    {isHeadOffice && (
                                        <div>
                                            <label htmlFor="ip_address" className="block text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">
                                                IP Address (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                id="ip_address"
                                                value={data.ip_address}
                                                onChange={(e) => setData('ip_address', e.target.value)}
                                                className="input-dark w-full text-[13px] sm:text-sm"
                                                placeholder="192.168.1.100"
                                            />
                                            {errors.ip_address && (
                                                <p className="mt-1 text-xs text-red-400">{errors.ip_address}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* AnyDesk Code */}
                                    <div className={isHeadOffice ? '' : 'col-span-1 md:col-span-2'}>
                                        <label htmlFor="anydesk_code" className="block text-xs font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1">
                                            AnyDesk Code (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            id="anydesk_code"
                                            value={data.anydesk_code}
                                            onChange={(e) => setData('anydesk_code', e.target.value)}
                                            className="input-dark w-full text-[13px] sm:text-sm"
                                            placeholder="123 456 789"
                                        />
                                        {errors.anydesk_code && (
                                            <p className="mt-1 text-xs text-red-400">{errors.anydesk_code}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2 mt-4">
                                Attachments (Optional)
                            </label>
                            <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors text-center shadow-inner">
                                <input
                                    type="file"
                                    id="attachments"
                                    multiple
                                    accept=".png,.jpg,.jpeg,.pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-500 dark:text-gray-500 light:text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="mt-2 text-xs sm:text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                                    <span className="text-accent-blue font-medium">Upload a file</span> or drag and drop
                                </p>
                                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 light:text-gray-400">
                                    PNG, JPG, PDF up to 5MB
                                </p>
                            </div>
                            {data.attachments.length > 0 && (
                                <ul className="mt-3 space-y-2">
                                    {data.attachments.map((file, index) => (
                                        <li key={index} className="flex items-center text-xs sm:text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 bg-white/5 border border-white/10 px-3 py-2 rounded-lg break-all">
                                            <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-400 light:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-white light:text-gray-900" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <span>Submit Ticket</span>
                                )}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </AuthenticatedLayout>
    );
}
