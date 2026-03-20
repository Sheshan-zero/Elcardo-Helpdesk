<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class TicketCommentController extends Controller
{
    public function store(Request $request, Ticket $ticket): RedirectResponse
    {
        // Simple authorization check: User must be able to view the ticket to comment
        // Admin/Super Admin can always comment. Users can comment on their own.
        // We defer to Policy or Gate, but for now simple check + validation.
        
        $user = Auth::user();
        
        if ($user->isUser() && $ticket->created_by_user_id != $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:1000'],
            'visibility' => ['required', 'string', 'in:PUBLIC,INTERNAL'],
        ]);

        // Users can only post PUBLIC comments
        if ($user->isUser() && $validated['visibility'] === 'INTERNAL') {
            abort(403, 'Users cannot post internal comments.');
        }

        TicketComment::create([
            'ticket_id' => $ticket->id,
            'author_user_id' => $user->id,
            'visibility' => $validated['visibility'],
            'body' => $validated['body'],
        ]);

        return back()->with('success', 'Comment added successfully.');
    }
}
