import { Link } from '@inertiajs/react';
import { User } from '@/types';
import { useState } from 'react';

interface TopHeaderProps {
    user: User;
    header?: React.ReactNode;
    onMenuClick?: () => void;
}

export default function TopHeader({ user, header, onMenuClick }: TopHeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <header className="sticky top-4 z-40 mx-4 mb-6 rounded-2xl bg-white/5 dark:bg-white/5 light:bg-white backdrop-blur-xl border border-white/10 dark:border-white/10 light:border-gray-200 shadow-glass dark:shadow-glass light:shadow-soft-lg px-6 py-3 flex items-center justify-between transition-all duration-300">
            {/* Left side: Hamburger (Mobile) + Title */}
            <div className="flex items-center gap-4 flex-1">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 rounded-xl text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                )}
                {header && <div className="text-xl font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 tracking-tight truncate">{header}</div>}
            </div>

            <div className="flex items-center gap-3">

                {/* Profile Settings */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 focus:outline-none"
                    >
                        <svg className="w-5 h-5 text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 hover:text-white dark:hover:text-white dark:text-white light:text-gray-900 light:hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)}></div>
                            <div className="absolute right-0 mt-3 w-48 py-2 bg-primary-800 dark:bg-primary-800 light:bg-white rounded-xl border border-white/10 dark:border-white/10 light:border-light-border shadow-2xl dark:shadow-2xl light:shadow-soft-lg z-40 backdrop-blur-xl">
                                <Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100 hover:text-white dark:hover:text-white dark:text-white light:text-gray-900 light:hover:text-gray-900 transition-colors">
                                    Profile Settings
                                </Link>
                                <div className="border-t border-white/10 dark:border-white/10 light:border-light-border my-1"></div>
                                <Link method="post" href={route('logout')} as="button" className="block w-full text-left px-4 py-2 text-sm text-red-400 dark:text-red-400 light:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/10 light:hover:bg-red-50 hover:text-red-300 dark:hover:text-red-300 light:hover:text-red-700 transition-colors">
                                    Log Out
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
