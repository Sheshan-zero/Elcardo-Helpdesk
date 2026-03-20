import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-body dark:bg-gradient-body light:bg-gradient-body-light relative overflow-hidden transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 dark:opacity-100 light:opacity-50">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 dark:bg-blue-600/20 light:bg-blue-400/40 blur-[120px] animate-float"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 dark:bg-purple-600/20 light:bg-purple-400/40 blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-cyan-600/20 dark:bg-cyan-600/20 light:bg-cyan-400/40 blur-[120px] animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-8 py-8 glass-card overflow-hidden z-10 animate-fade-in">
                <div className="flex justify-center mb-6">
                    <Link href="/">
                        <ApplicationLogo className="w-20 h-20 fill-current text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-blue-600" />
                    </Link>
                </div>

                {children}
            </div>
        </div>
    );
}
