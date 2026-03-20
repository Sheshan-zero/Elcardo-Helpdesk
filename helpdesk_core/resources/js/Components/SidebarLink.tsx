import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface SidebarLinkProps {
    href: string;
    active: boolean;
    icon: ReactNode;
    children: ReactNode;
}

export default function SidebarLink({ href, active, icon, children }: SidebarLinkProps) {
    return (
        <Link
            href={href}
            className={active ? 'sidebar-link-active' : 'sidebar-link'}
        >
            <span className="w-5 h-5">{icon}</span>
            <span>{children}</span>
        </Link>
    );
}
