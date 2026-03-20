export default function Logo({ size = 'medium', className = '' }: { size?: 'small' | 'medium' | 'large', className?: string }) {
    const sizeClasses = {
        small: 'h-8 w-8',
        medium: 'h-12 w-12',
        large: 'h-16 w-16',
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`${sizeClasses[size]} rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow`}>
                <span className="text-white dark:text-white light:text-gray-900 font-bold text-xl">E</span>
            </div>
            {size !== 'small' && (
                <div className="flex flex-col">
                    <span className="text-white dark:text-white light:text-gray-900 font-bold text-lg leading-none">Elcardo</span>
                    <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs">IT Helpdesk</span>
                </div>
            )}
        </div>
    );
}
