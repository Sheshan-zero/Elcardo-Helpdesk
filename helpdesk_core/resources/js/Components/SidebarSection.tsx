import { ReactNode } from 'react';

interface SidebarSectionProps {
    title: string;
    children: ReactNode;
}

export default function SidebarSection({ title, children }: SidebarSectionProps) {
    return (
        <div className="mb-6">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                {title}
            </h3>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}
