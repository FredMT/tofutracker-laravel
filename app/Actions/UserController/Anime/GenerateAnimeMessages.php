<?php

namespace App\Actions\UserController\Anime;

use App\Enums\WatchStatus;
use Illuminate\Http\Request;

class GenerateAnimeMessages
{
    public function handle(Request $request, array $collections): array
    {
        $messages = [];

        if (empty($collections)) {
            if (
                $request->filled('status') || $request->filled('title') ||
                $request->filled('genres') || $request->filled(['from_date', 'to_date'])
            ) {
                $filterDescriptions = [];
                if ($request->filled('title')) {
                    $filterDescriptions[] = "title '{$request->title}'";
                }
                if ($request->filled('status')) {
                    $status = WatchStatus::tryFrom($request->status);
                    if ($status) {
                        $filterDescriptions[] = "status '{$status->value}'";
                    }
                }

                if ($request->filled('genres')) {
                    $genreIds = explode(',', $request->genres);

                    // Only include valid numeric genre IDs that exist in config
                    $genreNames = collect($genreIds)
                        ->filter(fn($id) => is_numeric($id))
                        ->map(fn($id) => config("genres.{$id}"))
                        ->filter()
                        ->values();

                    if ($genreNames->isNotEmpty()) {
                        $filterDescriptions[] = "genres '" . $genreNames->implode(", ") . "'";
                    }
                }

                if ($request->filled(['from_date', 'to_date'])) {
                    $filterDescriptions[] = "date range {$request->from_date} to {$request->to_date}";
                }

                if (!empty($filterDescriptions)) {
                    $messages[] = "No anime found matching " . implode(", ", $filterDescriptions);
                } else {
                    $messages[] = "No anime found";
                }
            } else {
                $messages[] = "No anime found";
            }
        } else {
            $filterDescriptions = [];
            if ($request->filled('title')) {
                $filterDescriptions[] = "title '{$request->title}'";
            }
            if ($request->filled('status')) {
                $status = WatchStatus::tryFrom($request->status);
                if ($status) {
                    $filterDescriptions[] = "status '{$status->value}'";
                }
            }

            if ($request->filled('genres')) {
                $genreIds = explode(',', $request->genres);

                // Only include valid numeric genre IDs that exist in config
                $genreNames = collect($genreIds)
                    ->filter(fn($id) => is_numeric($id))
                    ->map(fn($id) => config("genres.{$id}"))
                    ->filter()
                    ->values();

                if ($genreNames->isNotEmpty()) {
                    $filterDescriptions[] = "genres '" . $genreNames->implode(", ") . "'";
                }
            }

            if ($request->filled(['from_date', 'to_date'])) {
                $filterDescriptions[] = "date range {$request->from_date} to {$request->to_date}";
            }

            if (!empty($filterDescriptions)) {
                $messages[] = "Showing anime matching " . implode(", ", $filterDescriptions);
            }
        }

        return $messages;
    }
}
