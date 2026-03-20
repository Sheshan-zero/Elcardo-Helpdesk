import { useEffect, FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white dark:text-white dark:text-white light:text-gray-900 light:text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-400 dark:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-600 text-sm">Join the Elcardo Helpdesk to get support.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700 mb-1">Full Name</label>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        className="input-dark"
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="John Doe"
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700 mb-1">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="input-dark"
                        autoComplete="username"
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300 dark:text-gray-300 dark:text-gray-300 light:text-gray-700 light:text-gray-700 mb-1">Confirm Password</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="input-dark"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full btn-primary flex justify-center items-center"
                    >
                        {processing ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>

                <div className="text-center">
                    <Link
                        href={route('login')}
                        className="text-sm text-accent-cyan dark:text-accent-cyan light:text-accent-blue hover:text-accent-blue dark:hover:text-accent-blue light:hover:text-blue-700 transition-colors font-medium"
                    >
                        Already have an account? Sign in
                    </Link>
                </div>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500 dark:text-gray-500 light:text-gray-400 dark:text-gray-400 light:text-gray-600 light:text-gray-400 dark:text-gray-400 light:text-gray-600">
                &copy; {new Date().getFullYear()} Elcardo Industries. <br /> Secured by IT Department.
            </div>
        </GuestLayout>
    );
}
