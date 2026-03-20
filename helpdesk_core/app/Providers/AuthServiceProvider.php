<?php

namespace App\Providers;

use App\Models\Branch;
use App\Models\Module;
use App\Models\Ticket;
use App\Policies\BranchPolicy;
use App\Policies\ModulePolicy;
use App\Policies\TicketPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Ticket::class => TicketPolicy::class,
        Branch::class => BranchPolicy::class,
        Module::class => ModulePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
