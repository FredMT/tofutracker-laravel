<?php

namespace App\Actions\UserController\Anime;

use App\Enums\WatchStatus;
use Illuminate\Http\Request;

class ValidateAnimeFilters
{
    public function handle(Request $request): array
    {
        $errors = [];

        if ($request->filled('status') && ! WatchStatus::tryFrom($request->status)) {
            $errors['status'] = 'Invalid status value';
        }

        if ($request->filled('genres')) {
            $genreIds = explode(',', $request->genres);

            // Check if all genre IDs are numeric
            if (! collect($genreIds)->every(fn ($id) => is_numeric($id))) {
                $errors['genres'] = 'All genre IDs must be numeric';
            } else {
                // Check if all genres exist in config
                $invalidGenres = collect($genreIds)
                    ->filter(fn ($id) => ! config("genres.{$id}"))
                    ->values();

                if ($invalidGenres->isNotEmpty()) {
                    $errors['genres'] = 'Invalid genre IDs: '.$invalidGenres->implode(', ');
                }
            }
        }

        if ($request->filled(['from_date', 'to_date'])) {
            try {
                $fromDate = new \DateTime($request->from_date);
                $toDate = new \DateTime($request->to_date);

                if ($fromDate > $toDate) {
                    $errors['date'] = 'From date cannot be later than to date';
                }
            } catch (\Exception $e) {
                $errors['date'] = 'Invalid date format';
            }
        }

        return $errors;
    }
}
