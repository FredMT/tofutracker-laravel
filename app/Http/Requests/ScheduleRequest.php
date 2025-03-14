<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class ScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (!$this->has('date')) {
            $this->merge([
                'date' => Carbon::today()->format('Y-m-d'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date', 'after_or_equal:today'],
            'type' => ['sometimes', 'string', 'in:anime,tv']
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'The date is required.',
            'date.date' => 'The date must be a valid date.',
            'date.after_or_equal' => 'The date cannot be in the past.',
            'type.string' => 'The type must be a string.',
        ];
    }
}
