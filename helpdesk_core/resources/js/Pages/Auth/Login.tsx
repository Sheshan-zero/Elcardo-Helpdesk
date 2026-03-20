import { useEffect, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Enter your credentials to access the Elcardo Helpdesk.</p>
            </div>

            {status && <div className="mb-4 font-medium text-sm text-green-400 dark:text-green-400 light:text-green-700 bg-green-400/10 dark:bg-green-400/10 light:bg-green-50 p-3 rounded-lg border border-green-400/20 dark:border-green-400/20 light:border-green-200">{status}</div>}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700 mb-1">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="input-dark"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@elcardo.com"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700 mb-1">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="input-dark"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="bg-white/10 dark:bg-white/10 light:bg-gray-100 border-white/20 dark:border-white/20 light:border-gray-300 text-accent-cyan focus:ring-accent-cyan rounded"
                        />
                        <span className="ms-2 text-sm text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-gray-300 light:text-gray-700 hover:text-white light:hover:text-gray-900 transition-colors underline decoration-white/30 light:decoration-gray-700/30 hover:decoration-white/80 light:hover:decoration-gray-900/80 underline-offset-4"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full btn-primary flex justify-center items-center"
                    >
                        {processing ? 'Logging in...' : 'Sign In'}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <Link
                        href={route('register')}
                        className="text-sm text-accent-cyan dark:text-accent-cyan light:text-accent-blue hover:text-accent-blue dark:hover:text-accent-blue light:hover:text-blue-700 transition-colors font-medium"
                    >
                        Don't have an account? Create one
                    </Link>
                </div>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600">
                &copy; {new Date().getFullYear()} Elcardo Industries. <br /> Secured by IT Department.
            </div>
        </GuestLayout>
    );
}
