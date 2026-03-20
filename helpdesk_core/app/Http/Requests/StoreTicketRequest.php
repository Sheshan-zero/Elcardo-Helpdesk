<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            'module_id' => ['required', 'exists:modules,id'],
            'phone' => ['required', 'string', 'max:20'],
            'issue_description' => ['required', 'string', 'min:10'],
            'ip_address' => ['nullable', 'ipv4'],
            'anydesk_code' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'in:LOW,MEDIUM,HIGH,URGENT'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:5120', 'mimes:png,jpg,jpeg,pdf'],
        ];
    }

    public function messages(): array
    {
        return [
            'issue_description.min' => 'Please provide a more detailed description (at least 10 characters).',
            'attachments.*.max' => 'Each file must be less than 5MB.',
            'attachments.*.mimes' => 'Only PNG, JPG, and PDF files are allowed.',
        ];
    }
}
