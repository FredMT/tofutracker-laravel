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
        if (!$this->has('start_date') && !$this->has('end_date')) {
            $this->merge([
                'start_date' => Carbon::today()->format('Y-m-d'),
                'end_date' => Carbon::today()->addDays(7)->format('Y-m-d'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required','date','after_or_equal:today'
            ],
            'end_date' => ['required','date','after_or_equal:start_date'
            ],
            'type' => ['sometimes','string','in:anime,tv'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'The start date is required.',
            'start_date.date' => 'The start date must be a valid date.',
            'start_date.after_or_equal' => 'The start date cannot be in the past.',
            'end_date.required' => 'The end date is required.',
            'end_date.date' => 'The end date must be a valid date.',
            'end_date.after_or_equal' => 'The end date must be equal to or after the start date.',
            'type.string' => 'The type must be a string.',
        ];
    }
}
