<?php

namespace App\Actions\UserController\Tv;

use Illuminate\Http\Request;
use Carbon\Carbon;

class GenerateShowMessages
{
    public function handle(Request $request, array $shows): array
    {
        $messages = [];

        if (empty($shows)) {
            $appliedFilters = [];

            if ($request->filled('title')) {
                $appliedFilters[] = "title \"{$request->title}\"";
            }

            if ($request->filled('status')) {
                $appliedFilters[] = "status \"{$request->status}\"";
            }

            if ($request->filled('genres')) {
                $validGenres = config('genres');
                $genreNames = collect(explode(',', $request->genres))
                    ->map(fn($id) => $validGenres[(int)$id] ?? null)
                    ->filter()
                    ->implode(', ');
                $appliedFilters[] = "genres: {$genreNames}";
            }

            if ($request->filled(['from_date', 'to_date'])) {
                $fromDate = Carbon::parse($request->from_date)->format('jS F, Y');
                $toDate = Carbon::parse($request->to_date)->format('jS F, Y');
                $appliedFilters[] = "between {$fromDate} and {$toDate}";
            }

            if (count($appliedFilters) > 0) {
                $messages[] = "No shows found matching " .
                    (count($appliedFilters) > 1
                        ? "all of these filters: " . implode(', ', $appliedFilters)
                        : "the filter: " . $appliedFilters[0]);
            } else {
                $messages[] = "You do not have any shows in your library";
            }
        }

        return $messages;
    }
}
