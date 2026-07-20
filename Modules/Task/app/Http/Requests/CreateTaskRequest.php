<?php

namespace Modules\Task\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTaskRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['required','string','min:3','max:30'],
            'description' => ['required','min:3','max:255'],
            'due_date' => ['required','date'],
            'priority' => ['nullable','in:low,medium,high'],
            'assigned_to' => ['required','array'],
            'assigned_to.*' => ['required','exists:users,id','min:1'],
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
