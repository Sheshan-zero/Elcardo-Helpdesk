<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind the public path specifically for the production server environment
        if (str_contains(base_path(), 'helpdesk_core')) {
            $this->app->usePublicPath(base_path('../ithelpdesk.elcardo.com'));
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
