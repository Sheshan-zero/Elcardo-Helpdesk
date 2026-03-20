<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SlaPolicy extends Model
{
    protected $fillable = [
        'name',
        'applies_to_branch_id',
        'applies_to_module_id',
        'priority',
        'first_response_minutes',
        'resolution_minutes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'first_response_minutes' => 'integer',
        'resolution_minutes' => 'integer',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'applies_to_branch_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'applies_to_module_id');
    }

    /**
     * Find the most specific matching SLA policy for a ticket.
     * Priority order (most specific wins):
     * 1. Branch + Module + Priority
     * 2. Branch + Module
     * 3. Branch + Priority
     * 4. Module + Priority
     * 5. Branch only
     * 6. Module only
     * 7. Priority only
     * 8. Default (all nulls)
     */
    public static function findMatchingPolicy(Ticket $ticket): ?self
    {
        $policies = self::where('is_active', true)->get();

        if ($policies->isEmpty()) {
            return null;
        }

        $bestMatch = null;
        $bestScore = -1;

        foreach ($policies as $policy) {
            $score = self::calculateMatchScore($policy, $ticket);
            
            if ($score !== false && $score > $bestScore) {
                $bestScore = $score;
                $bestMatch = $policy;
            }
        }

        return $bestMatch;
    }

    /**
     * Calculate match score for a policy against a ticket.
     * Returns false if policy doesn't match, otherwise returns specificity score.
     */
    protected static function calculateMatchScore(self $policy, Ticket $ticket): int|false
    {
        $score = 0;

        // Check branch match
        if ($policy->applies_to_branch_id !== null) {
            if ($policy->applies_to_branch_id != $ticket->branch_id) {
                return false; // Doesn't match
            }
            $score += 4; // Branch match adds 4 points
        }

        // Check module match
        if ($policy->applies_to_module_id !== null) {
            if ($policy->applies_to_module_id != $ticket->module_id) {
                return false; // Doesn't match
            }
            $score += 2; // Module match adds 2 points
        }

        // Check priority match
        if ($policy->priority !== null) {
            if ($policy->priority != $ticket->priority) {
                return false; // Doesn't match
            }
            $score += 1; // Priority match adds 1 point
        }

        return $score;
    }

    /**
     * Scope for active policies.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
