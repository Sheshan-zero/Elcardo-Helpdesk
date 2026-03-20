<?php

namespace App\Jobs;

use App\Models\TicketNotificationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendTicketEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public TicketNotificationLog $log,
        public string $body,
        public bool $isHtml = false
    ) {}

    public function handle(): void
    {
        try {
            if ($this->isHtml) {
                Mail::html($this->body, function ($message) {
                    $message->to($this->log->recipient_email)
                        ->subject($this->log->subject);
                });
            } else {
                Mail::raw($this->body, function ($message) {
                    $message->to($this->log->recipient_email)
                        ->subject($this->log->subject);
                });
            }

            $this->log->markAsSent();
        } catch (\Exception $e) {
            $this->log->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->log->markAsFailed($exception->getMessage());
    }
}
