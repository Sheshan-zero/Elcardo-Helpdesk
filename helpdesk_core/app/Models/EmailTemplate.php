<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'subject',
        'body',
        'is_html',
    ];

    protected $casts = [
        'is_html' => 'boolean',
    ];

    /**
     * Render the template with given variables.
     */
    public function render(array $variables): array
    {
        $subject = $this->subject;
        $body = $this->body;

        foreach ($variables as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $subject = str_replace($placeholder, $value ?? '', $subject);
            $body = str_replace($placeholder, $value ?? '', $body);
        }

        return [
            'subject' => $subject,
            'body' => $body,
            'is_html' => $this->is_html,
        ];
    }
}
