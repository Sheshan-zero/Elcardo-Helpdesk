import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps, Branch, Module } from '@/types';
import { FormEventHandler, useState, useEffect, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import axios from 'axios';
import GlassCard from '@/Components/GlassCard';
import SearchableSelect from '@/Components/SearchableSelect';

interface Props extends PageProps {
    branches: Pick<Branch, 'id' | 'name' | 'is_head_office'>[];
    modules: Pick<Module, 'id' | 'name'>[];
}

export default function Create({ auth, branches, modules }: Props) {
    const [selectedBranch, setSelectedBranch] = useState<Pick<Branch, 'id' | 'name' | 'is_head_office'> | null>(null);
    const [kbSuggestions, setKbSuggestions] = useState<{ id: number; title: string; slug: string; summary: string }[]>([]);
    
    // User Management State
    const [userCreationMode, setUserCreationMode] = useState<'existing' | 'new'>('existing');
    const [userQuery, setUserQuery] = useState('');
    const [userResults, setUserResults] = useState<{ id: number; name: string; email: string }[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; email: string } | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        new_user_name: '',
        new_user_email: '',
        branch_id: '',
        module_id: '',
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

    useEffect(() => {
        if (data.module_id) {
            axios.get(route('kb.suggestions'), { params: { module_id: data.module_id } })
                .then(res => setKbSuggestions(res.data))
                .catch(() => setKbSuggestions([]));
        } else {
            setKbSuggestions([]);
        }
    }, [data.module_id]);

    // Async User Search
    useEffect(() => {
        if (userQuery.length < 2) {
            setUserResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setIsSearchingUsers(true);
            axios.get(route('admin.users.search'), { params: { q: userQuery } })
                .then(res => setUserResults(res.data))
                .catch(err => console.error(err))
                .finally(() => setIsSearchingUsers(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [userQuery]);

    // Update form when selected user changes
    useEffect(() => {
        setData('user_id', selectedUser ? selectedUser.id.toString() : '');
    }, [selectedUser]);

    const isHeadOffice = selectedBranch?.is_head_office || false;

    const sortedBranches = [...branches].sort((a, b) => {
        if (a.is_head_office) return -1;
        if (b.is_head_office) return 1;
        return a.name.localeCompare(b.name);
    });

    const sortedModules = [...modules].sort((a, b) => {
        if (a.name.toLowerCase() === 'other') return 1;
        if (b.name.toLowerCase() === 'other') return -1;
        return a.name.localeCompare(b.name);
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('attachments', Array.from(e.target.files));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // If 'existing' mode but no user selected, don't submit unless validation enforces it later
        if (userCreationMode === 'existing' && !selectedUser) {
            // we could show an error, but let backend validate it
        }

        const payload: any = { ...data };
        
        // Clear fields based on mode
        if (userCreationMode === 'existing') {
            payload.new_user_name = '';
            payload.new_user_email = '';
        } else {
            payload.user_id = '';
        }

        post(route('admin.tickets.store'), {
            forceFormData: true,
            data: payload,
            onError: (errors) => {
                console.error('Form errors:', errors);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="font-bold text-xl text-white leading-tight">Create Ticket for User</h2>
                    <Link href={route('admin.tickets.index')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/10">
                        Back to Tickets
                    </Link>
                </div>
            }
        >
            <Head title="Create Admin Ticket" />

            <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-0 pb-12">
                <GlassCard className="p-4 sm:p-6 md:p-8 mt-6">
                    <form onSubmit={submit} className="space-y-8">
                        
                        {/* 1. Requestor Information */}
                        <div>
                            <div className="mb-4 border-b border-white/10 pb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-sm border border-accent-blue/30">1</span>
                                    Requestor Information
                                </h3>
                            </div>
                            
                            <div className="mb-4 flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="userMode" 
                                        checked={userCreationMode === 'existing'} 
                                        onChange={() => setUserCreationMode('existing')} 
                                        className="text-accent-blue focus:ring-accent-blue bg-white/5 border border-white/20" 
                                    />
                                    <span className="text-gray-200">Select Existing User</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="userMode" 
                                        checked={userCreationMode === 'new'} 
                                        onChange={() => setUserCreationMode('new')} 
                                        className="text-accent-blue focus:ring-accent-blue bg-white/5 border border-white/20" 
                                    />
                                    <span className="text-gray-200">Create Temporary User</span>
                                </label>
                            </div>

                            {userCreationMode === 'existing' ? (
                                <div className="max-w-md">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Search User <span className="text-red-400">*</span>
                                    </label>
                                    <Combobox value={selectedUser} onChange={setSelectedUser}>
                                        <div className="relative mt-1">
                                            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white/5 text-left border border-white/10 focus-within:ring-2 focus-within:ring-accent-blue focus-within:border-transparent sm:text-sm">
                                                <Combobox.Input
                                                    className="w-full border-none bg-transparent py-2.5 pl-3 pr-10 text-sm leading-5 text-white focus:ring-0"
                                                    displayValue={(user: any) => user ? `${user.name} (${user.email})` : ''}
                                                    onChange={(event) => setUserQuery(event.target.value)}
                                                    placeholder="Search by name or email..."
                                                    required={!data.user_id}
                                                />
                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    {isSearchingUsers ? (
                                                        <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                                                        </svg>
                                                    )}
                                                </Combobox.Button>
                                            </div>
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                                afterLeave={() => setUserQuery('')}
                                            >
                                                <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 text-base shadow-lg ring-1 ring-white/10 focus:outline-none sm:text-sm z-50">
                                                    {userResults.length === 0 && userQuery.length >= 2 && !isSearchingUsers ? (
                                                        <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
                                                            Nothing found.
                                                        </div>
                                                    ) : (
                                                        userResults.map((user) => (
                                                            <Combobox.Option
                                                                key={user.id}
                                                                className={({ active }) =>
                                                                    `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                                                                        active ? 'bg-accent-blue/20 text-accent-blue' : 'text-gray-200'
                                                                    }`
                                                                }
                                                                value={user}
                                                            >
                                                                {({ selected, active }) => (
                                                                    <>
                                                                        <span className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal'}`}>
                                                                            {user.name} <span className="text-gray-400 text-xs ml-2">({user.email})</span>
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </Combobox.Option>
                                                        ))
                                                    )}
                                                </Combobox.Options>
                                            </Transition>
                                        </div>
                                    </Combobox>
                                    {errors.user_id && <p className="mt-1 text-xs text-red-400">{errors.user_id}</p>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div>
                                        <label htmlFor="new_user_name" className="block text-sm font-medium text-gray-300 mb-1">
                                            User Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="new_user_name"
                                            value={data.new_user_name}
                                            onChange={(e) => setData('new_user_name', e.target.value)}
                                            className="input-dark w-full text-sm sm:text-base"
                                            placeholder="John Doe"
                                            required={userCreationMode === 'new'}
                                        />
                                        {errors.new_user_name && <p className="mt-1 text-xs text-red-400">{errors.new_user_name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="new_user_email" className="block text-sm font-medium text-gray-300 mb-1">
                                            Email Address <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="new_user_email"
                                            value={data.new_user_email}
                                            onChange={(e) => setData('new_user_email', e.target.value)}
                                            className="input-dark w-full text-sm sm:text-base"
                                            placeholder="john@elcardo.com"
                                            required={userCreationMode === 'new'}
                                        />
                                        <p className="mt-1 text-xs text-gray-400">A temporary password will be generated automatically.</p>
                                        {errors.new_user_email && <p className="mt-1 text-xs text-red-400">{errors.new_user_email}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Issue Details */}
                        <div>
                            <div className="mb-4 border-b border-white/10 pb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-sm border border-accent-blue/30">2</span>
                                    Ticket Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="branch_id" className="block text-sm font-medium text-gray-300 mb-1">
                                        Branch <span className="text-red-400">*</span>
                                    </label>
                                    <SearchableSelect
                                        id="branch_id"
                                        value={data.branch_id}
                                        onChange={(value) => setData('branch_id', value.toString())}
                                        options={sortedBranches}
                                        placeholder="Select a branch..."
                                        required
                                    />
                                    {errors.branch_id && <p className="mt-1 text-xs text-red-400">{errors.branch_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="module_id" className="block text-sm font-medium text-gray-300 mb-1">
                                        Module <span className="text-red-400">*</span>
                                    </label>
                                    <SearchableSelect
                                        id="module_id"
                                        value={data.module_id}
                                        onChange={(value) => setData('module_id', value.toString())}
                                        options={sortedModules}
                                        placeholder="Select a module..."
                                        required
                                    />
                                    {errors.module_id && <p className="mt-1 text-xs text-red-400">{errors.module_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
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
                                    {errors.priority && <p className="mt-1 text-xs text-red-400">{errors.priority}</p>}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="issue_description" className="block text-sm font-medium text-gray-300 mb-1">
                                    Issue Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    id="issue_description"
                                    rows={5}
                                    value={data.issue_description}
                                    onChange={(e) => setData('issue_description', e.target.value)}
                                    className="textarea-dark w-full text-sm sm:text-base"
                                    placeholder="Please describe the issue in detail..."
                                    minLength={10}
                                    required
                                />
                                {errors.issue_description && <p className="mt-1 text-xs text-red-400">{errors.issue_description}</p>}
                            </div>

                            {/* Remote Access Section */}
                            {selectedBranch && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 mb-6">
                                    <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 00-2-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>Remote Access Information (Optional)</span>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        {isHeadOffice && (
                                            <div>
                                                <label htmlFor="ip_address" className="block text-xs font-medium text-gray-400 mb-1">
                                                    IP Address
                                                </label>
                                                <input
                                                    type="text"
                                                    id="ip_address"
                                                    value={data.ip_address}
                                                    onChange={(e) => setData('ip_address', e.target.value)}
                                                    className="input-dark w-full text-[13px] sm:text-sm"
                                                    placeholder="192.168.1.100"
                                                />
                                            </div>
                                        )}
                                        <div className={isHeadOffice ? '' : 'col-span-1 md:col-span-2'}>
                                            <label htmlFor="anydesk_code" className="block text-xs font-medium text-gray-400 mb-1">
                                                AnyDesk Code
                                            </label>
                                            <input
                                                type="text"
                                                id="anydesk_code"
                                                value={data.anydesk_code}
                                                onChange={(e) => setData('anydesk_code', e.target.value)}
                                                className="input-dark w-full text-[13px] sm:text-sm"
                                                placeholder="123 456 789"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                                    <svg className="mx-auto h-10 w-10 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-400">
                                        <span className="text-accent-blue font-medium">Upload a file</span> or drag and drop
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        PNG, JPG, PDF up to 10MB
                                    </p>
                                </div>
                                {data.attachments.length > 0 && (
                                    <ul className="mt-3 space-y-2">
                                        {data.attachments.map((file, index) => (
                                            <li key={index} className="flex items-center text-sm text-gray-300 bg-white/5 border border-white/10 px-3 py-2 rounded-lg break-all">
                                                <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                {file.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <span>Create Ticket</span>
                                )}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </AuthenticatedLayout>
    );
}
