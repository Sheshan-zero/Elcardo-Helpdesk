import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface NotificationSetting {
    id: number;
    key: string;
    label: string;
    description: string | null;
    enabled: boolean;
}

interface Props extends PageProps {
    settings: NotificationSetting[];
}

export default function NotificationSettings({ auth, settings }: Props) {
    const handleToggle = (key: string, currentEnabled: boolean) => {
        router.patch(route('superadmin.notifications.update', key), {
            enabled: !currentEnabled,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-white dark:text-white light:text-gray-900 leading-tight">Notification Settings</h2>}
        >
            <Head title="Notification Settings" />

            <div className="py-12 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass-card p-8 animate-fade-in">
                        <div className="mb-8 border-b border-white/10 pb-6">
                            <h3 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-2">Email Notifications</h3>
                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                                Control which automated email notifications are sent to administrators and agents.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {settings.map((setting) => (
                                <div
                                    key={setting.id}
                                    className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <div className="pr-8">
                                        <h3 className="font-bold text-lg text-white dark:text-white light:text-gray-900 mb-1">{setting.label}</h3>
                                        <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 leading-relaxed">{setting.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(setting.key, setting.enabled)}
                                        className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${setting.enabled ? 'bg-indigo-600' : 'bg-gray-700'
                                            }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${setting.enabled ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
