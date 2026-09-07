<?php

namespace Modules\Task\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'min:3', 'max:30'],
            'description' => ['sometimes', 'min:3', 'max:255'],
            'due_date' => ['sometimes', 'date'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'assigned_to' => ['sometimes', 'array'],
            'assigned_to.*' => ['required', 'exists:users,id', 'min:1'],
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }
}
