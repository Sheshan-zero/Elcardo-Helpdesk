import Link from '@/Components/NavLink';
import { User } from '@/types';
import { Link as InertiaLink } from '@inertiajs/react';

interface SidebarProps {
    user: User;
    currentRoute: string;
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Sidebar({ user, isOpen = false, setIsOpen }: SidebarProps) {
    // Helper to determine active state using the route() helper if available globally, or matching paths
    // Note: In typical Laravel/Inertia setup, route().current() is available.
    const isActive = (routeName: string) => route().current(routeName + '*');

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen && setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-4 left-4 w-64 bg-primary-800/80 dark:bg-primary-800/80 light:bg-white backdrop-blur-xl rounded-2xl flex flex-col z-50 shadow-2xl dark:shadow-2xl light:shadow-soft-xl border border-white/5 dark:border-white/5 light:border-gray-200 overflow-hidden transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'
                    }`}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center px-8 border-b border-white/5 dark:border-white/5 light:border-gray-200">
                    <InertiaLink href="/" className="flex items-center gap-3">
                        <ApplicationLogo className="w-8 h-8" />
                        <span className="text-lg font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 tracking-wide">Elcardo</span>
                    </InertiaLink>
                    <div className="ml-auto text-xs font-medium text-accent-cyan dark:text-accent-cyan light:text-blue-600 px-2 py-0.5 rounded bg-accent-cyan/10 dark:bg-accent-cyan/10 light:bg-blue-50 border border-accent-cyan/20 dark:border-accent-cyan/20 light:border-blue-200">
                        BETA
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin">

                    {/* User Section */}
                    <div className="mb-2">
                        <SidebarLink href={route('dashboard')} active={isActive('dashboard')} icon="home">
                            Dashboard
                        </SidebarLink>
                        <SidebarLink href={route('tickets.create')} active={isActive('tickets.create')} icon="plus">
                            New Ticket
                        </SidebarLink>
                        <SidebarLink href={route('my.tickets')} active={isActive('my.tickets')} icon="ticket">
                            My Tickets
                        </SidebarLink>
                    </div>

                    {/* Admin Section */}
                    {(user.role === 'admin' || user.role === 'super_admin') && (
                        <>
                            <div className="sidebar-section-title">Admin</div>
                            <SidebarLink href={route('admin.tickets.create')} active={isActive('admin.tickets.create')} icon="plus">
                                Create Ticket
                            </SidebarLink>
                            <SidebarLink href={route('admin.tickets.index')} active={isActive('admin.tickets.index')} icon="inbox">
                                All Tickets
                            </SidebarLink>
                            <SidebarLink href={route('admin.kanban')} active={isActive('admin.kanban')} icon="kanban">
                                Kanban Board
                            </SidebarLink>
                            <SidebarLink href={route('admin.reports.index')} active={isActive('admin.reports')} icon="chart">
                                Reports
                            </SidebarLink>
                        </>
                    )}

                    {/* Super Admin Section */}
                    {user.role === 'super_admin' && (
                        <>
                            <div className="sidebar-section-title">System</div>
                            <SidebarLink href={route('superadmin.users.index')} active={isActive('superadmin.users')} icon="users">
                                Users
                            </SidebarLink>
                            <SidebarLink href={route('superadmin.modules.index')} active={isActive('superadmin.modules')} icon="cube">
                                Modules
                            </SidebarLink>
                            <SidebarLink href={route('superadmin.branches.index')} active={isActive('superadmin.branches')} icon="building">
                                Branches
                            </SidebarLink>
                            <SidebarLink href={route('superadmin.sla.index')} active={isActive('superadmin.sla')} icon="clock">
                                SLA Policies
                            </SidebarLink>
                            <SidebarLink href={route('superadmin.kb.index')} active={isActive('superadmin.kb')} icon="files">
                                Knowledge Base
                            </SidebarLink>

                            <div className="sidebar-section-title">Settings</div>
                            <SidebarLink href={route('superadmin.notifications.index')} active={isActive('superadmin.notifications')} icon="bell">
                                Notifications
                            </SidebarLink>
                            <SidebarLink href={route('superadmin.templates.index')} active={isActive('superadmin.templates')} icon="mail">
                                Email Templates
                            </SidebarLink>
                            <SidebarLink href={route('superadmin.wallboard.index')} active={isActive('superadmin.wallboard')} icon="monitor">
                                Wallboard
                            </SidebarLink>
                        </>
                    )}

                    {/* Help Section */}
                    <>
                        <div className="sidebar-section-title">Support</div>
                        <SidebarLink href={route('kb.index')} active={isActive('kb')} icon="book">
                            Knowledge Base
                        </SidebarLink>
                    </>
                </nav>

                {/* User Profile Summary (Bottom) */}
                <div className="p-4 border-t border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-primary-900">
                            {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-medium text-white dark:text-white light:text-gray-900 truncate">{user.name}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 truncate capitalize">{user.role.replaceAll('_', ' ')}</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

// Internal reusable link component
function SidebarLink({ href, active, icon, children }: { href: string; active: boolean; icon: string; children: React.ReactNode }) {
    // Icon mapping
    const icons: Record<string, React.ReactNode> = {
        home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        plus: <path d="M12 4v16m8-8H4" />,
        ticket: <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />,
        inbox: <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />,
        kanban: <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />,
        chart: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
        cube: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
        building: <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
        clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        cog: <><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
        book: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
        files: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
        users: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
        bell: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
        mail: <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
        monitor: <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    };

    return (
        <InertiaLink
            href={href}
            className={`group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl font-medium transition-all duration-300 ${active
                ? 'bg-gradient-accent text-white dark:text-white light:text-gray-900 shadow-glow'
                : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:bg-white/10 hover:text-white dark:text-white light:text-gray-900'
                }`}
        >
            <svg
                className={`w-5 h-5 transition-colors ${active ? 'text-white dark:text-white light:text-gray-900' : 'text-gray-400 dark:text-gray-400 light:text-gray-600 group-hover:text-white dark:text-white light:text-gray-900'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
            >
                {icons[icon] || icons['home']}
            </svg>
            <span className="text-sm">{children}</span>
        </InertiaLink>
    );
}
