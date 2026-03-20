import { PropsWithChildren, ReactNode } from 'react';
import { User } from '@/types';
import Sidebar from '@/Components/Sidebar';
import TopHeader from '@/Components/TopHeader';

export default function SidebarLayout({
    user,
    children,
}: PropsWithChildren<{ user: User }>) {
    const currentRoute = route().current() || window.location.pathname;

    return (
        <div className="flex h-screen bg-gradient-dark text-gray-200 dark:text-gray-200 light:text-gray-800 overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={user} currentRoute={currentRoute} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <TopHeader user={user} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-dark-pattern">
                    {children}
                </main>
            </div>
        </div>
    );
}
