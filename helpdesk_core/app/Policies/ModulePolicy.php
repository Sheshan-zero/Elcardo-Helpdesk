<?php

namespace App\Policies;

use App\Models\Module;
use App\Models\User;

class ModulePolicy
{
    /**
     * Only Super Admin can manage modules.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }
        return false;
    }

    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, Module $module): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Module $module): bool
    {
        return false;
    }

    public function delete(User $user, Module $module): bool
    {
        return false;
    }
}
