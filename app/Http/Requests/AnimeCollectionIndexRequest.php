<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnimeCollectionIndexRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Everyone is authorized to view anime collections
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 25, 50, 100])],
            'sort' => [
                'sometimes',
                'string',
                Rule::in(['id', 'collection_name', 'created_at', 'updated_at'])
            ],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
        ];
    }

    /**
     * Get the validated data from the request with default values.
     *
     * @return array
     */
    public function validatedWithDefaults(): array
    {
        $validated = $this->validated();

        // Apply default values
        return [
            'per_page' => $validated['per_page'] ?? 25,
            'sort' => $validated['sort'] ?? 'id',
            'direction' => $validated['direction'] ?? 'asc',
            'page' => $validated['page'] ?? 1,
        ];
    }
}
