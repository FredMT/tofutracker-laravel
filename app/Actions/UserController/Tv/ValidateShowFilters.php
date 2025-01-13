<?php

namespace App\Actions\UserController\Tv;

use App\Enums\WatchStatus;
use DateTime;
use Illuminate\Http\Request;

class ValidateShowFilters
{
    public function handle(Request $request): array
    {
        $errors = [];

        if ($request->filled('status') && ! WatchStatus::tryFrom($request->status)) {
            $errors['status'] = 'Invalid watch status. Valid statuses are: '.implode(', ', array_column(WatchStatus::cases(), 'value'));
        }

        if ($request->filled('genres')) {
            $genreIds = collect(explode(',', $request->genres))
                ->map(function ($id) {
                    // Check if the value is numeric
                    return is_numeric($id) ? (int) $id : null;
                })
                ->filter();

            if ($genreIds->isNotEmpty()) {
                $validGenres = config('genres');
                $invalidGenres = $genreIds->filter(fn ($id) => ! isset($validGenres[$id]));

                if ($invalidGenres->isNotEmpty()) {
                    $errors['genres'] = 'Invalid genre IDs: '.$invalidGenres->implode(', ');
                }
            } else {
                $errors['genres'] = 'Genre IDs must be numeric values';
            }
        }

        if ($request->filled(['from_date', 'to_date'])) {
            try {
                new DateTime($request->from_date);
                new DateTime($request->to_date);
            } catch (\Exception $e) {
                $errors['dates'] = 'Invalid date format. Dates should be in ISO 8601 format.';
            }
        }

        return $errors;
    }
}
