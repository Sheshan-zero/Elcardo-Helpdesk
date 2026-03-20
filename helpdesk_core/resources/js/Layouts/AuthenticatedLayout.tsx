import { PropsWithChildren, ReactNode, useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import TopHeader from '@/Components/TopHeader';
import { User } from '@/types';

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-transparent font-sans text-gray-100 flex relative">
            {/* Left Sidebar - Fixed */}
            <Sidebar user={user} currentRoute={currentRoute} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 w-full lg:pl-72 relative min-h-screen flex flex-col transition-all duration-300 overflow-x-hidden">
                {/* Floating Glass Header */}
                <TopHeader user={user} header={header} onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Content */}
                <main className="flex-1 px-4 pb-8 animate-fade-in">
                    {children}
                </main>

                {/* Footer (Optional) */}
                <footer className="py-4 text-center text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} Elcardo Industries. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
