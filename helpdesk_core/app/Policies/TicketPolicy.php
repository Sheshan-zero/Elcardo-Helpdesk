<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Determine if user can view any tickets.
     * Admin and Super Admin can view all tickets.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdminOrAbove();
    }

    /**
     * Determine if user can view a specific ticket.
     * Owner, Admin, or Super Admin can view.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->isAdminOrAbove() || $ticket->created_by_user_id == $user->id;
    }

    /**
     * Determine if user can create tickets.
     * Any authenticated user can create tickets.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if user can update a ticket.
     * Admin/Super Admin can update any ticket.
     * Users can update their own tickets (e.g., to confirm fixed).
     */
    public function update(User $user, Ticket $ticket): bool
    {
        return $user->isAdminOrAbove() || $ticket->created_by_user_id == $user->id;
    }

    /**
     * Determine if user can delete a ticket.
     * Only Super Admin can delete.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->isSuperAdmin();
    }
}
