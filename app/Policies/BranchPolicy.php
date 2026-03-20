<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

class BranchPolicy
{
    /**
     * Only Super Admin can manage branches.
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

    public function view(User $user, Branch $branch): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Branch $branch): bool
    {
        return false;
    }

    public function delete(User $user, Branch $branch): bool
    {
        return false;
    }
}
