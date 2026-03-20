import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'px-6 py-3 rounded-full bg-red-600 text-white dark:text-white light:text-gray-900 font-medium hover:bg-red-700 hover:shadow-glow transition-all duration-300',
        ghost: 'px-6 py-3 rounded-full text-gray-300 dark:text-gray-300 light:text-gray-700 font-medium hover:bg-white/5 transition-all duration-300',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg',
    };

    const baseClasses = variant === 'primary' || variant === 'secondary' || variant === 'danger' || variant === 'ghost'
        ? variants[variant]
        : variants.primary;

    return (
        <button
            className={`${baseClasses} ${variant !== 'primary' && variant !== 'secondary' ? sizes[size] : ''} inline-flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : icon}
            {children}
        </button>
    );
}
