import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function GlassCard({ children, className = '', hover = false, padding = 'md' }: GlassCardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const baseClass = hover ? 'glass-card-hover' : 'glass-card';

    return (
        <div className={`${baseClass} ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
}
