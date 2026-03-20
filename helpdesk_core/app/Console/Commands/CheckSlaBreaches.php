<?php

namespace App\Console\Commands;

use App\Services\SlaService;
use Illuminate\Console\Command;

class CheckSlaBreaches extends Command
{
    protected $signature = 'sla:check-breaches';
    protected $description = 'Check for SLA breaches on all open tickets';

    public function handle(SlaService $slaService): int
    {
        $breachCount = $slaService->checkAllBreaches();
        
        $this->info("SLA breach check complete. {$breachCount} new breaches detected.");
        
        return self::SUCCESS;
    }
}
