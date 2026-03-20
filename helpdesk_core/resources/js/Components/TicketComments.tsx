import { TicketComment, User } from '@/types';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    ticketId: number;
    comments: TicketComment[];
    userRole: string; // 'admin', 'super_admin', 'user'
}

export default function TicketComments({ ticketId, comments, userRole }: Props) {
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    const [visibility, setVisibility] = useState<'PUBLIC' | 'INTERNAL'>('PUBLIC');

    const { data, setData, post, processing, reset, errors } = useForm({
        body: '',
        visibility: 'PUBLIC',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const routeName = isAdmin ? 'admin.tickets.comments.store' : 'my.tickets.comments.store';

        post(route(routeName, ticketId), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900">Discussion</h3>

            {/* Comment List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 italic">No comments yet.</p>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${comment.visibility === 'INTERNAL'
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white dark:text-white light:text-gray-900 shadow-lg">
                                        {comment.user?.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`font-semibold text-sm ${comment.visibility === 'INTERNAL' ? 'text-yellow-200' : 'text-white dark:text-white light:text-gray-900'}`}>
                                            {comment.user?.name}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {comment.visibility === 'INTERNAL' && (
                                    <span className="bg-yellow-500/20 text-yellow-300 dark:text-yellow-300 light:text-yellow-700 text-xs px-2 py-1 rounded-lg border border-yellow-500/30 font-bold uppercase tracking-wider">
                                        Internal Note
                                    </span>
                                )}
                            </div>
                            <div className={`text-sm whitespace-pre-wrap leading-relaxed ${comment.visibility === 'INTERNAL' ? 'text-yellow-100/80' : 'text-gray-300 dark:text-gray-300 light:text-gray-700'}`}>
                                {comment.body}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">Add a Reply</label>
                        <textarea
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            className="input-dark w-full min-h-[100px]"
                            rows={3}
                            placeholder="Type your message here..."
                        />
                        {errors.body && <p className="text-red-400 text-sm mt-1">{errors.body}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="w-full sm:w-auto">
                            {isAdmin && (
                                <div className="flex items-center space-x-4 bg-black/20 p-1 rounded-lg">
                                    <label className={`cursor-pointer px-3 py-1.5 rounded-md text-sm transition-all ${data.visibility === 'PUBLIC' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900'}`}>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            name="visibility"
                                            value="PUBLIC"
                                            checked={data.visibility === 'PUBLIC'}
                                            onChange={(e) => setData('visibility', e.target.value)}
                                        />
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Public Reply
                                        </span>
                                    </label>
                                    <label className={`cursor-pointer px-3 py-1.5 rounded-md text-sm transition-all ${data.visibility === 'INTERNAL' ? 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-300 light:text-yellow-700' : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:text-white light:text-gray-900'}`}>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            name="visibility"
                                            value="INTERNAL"
                                            checked={data.visibility === 'INTERNAL'}
                                            onChange={(e) => setData('visibility', e.target.value)}
                                        />
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Internal Note
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full sm:w-auto px-6 py-2 rounded-lg text-sm font-bold text-white dark:text-white light:text-gray-900 shadow-lg transition-all transform hover:scale-105 ${data.visibility === 'INTERNAL'
                                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 border border-yellow-500/30'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-500/30'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {processing ? 'Posting...' : (data.visibility === 'INTERNAL' ? 'Post Note' : 'Post Reply')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
