<?php

namespace App\Logging;

use App\Models\AppLog;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\LogRecord;

class DatabaseHandler extends AbstractProcessingHandler
{
    /**
     * Writes the record down to the log of the implementing handler.
     *
     * @param array|LogRecord $record
     */
    protected function write(array|LogRecord $record): void
    {
        // Support for Monolog 2 (array) and 3 (LogRecord object)
        $levelName = is_array($record) ? strtolower($record['level_name']) : strtolower($record->level->getName());
        $message = is_array($record) ? $record['message'] : $record->message;
        $context = is_array($record) ? $record['context'] : $record->context;

        AppLog::create([
            'level' => $levelName,
            'message' => $message,
            'context' => !empty($context) ? $context : null,
        ]);
    }
}
