<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnidbAnimeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $startDate = $this->startdate ? Carbon::parse($this->startdate) : null;
        $season = null;

        // Check if startdate is not the default date (1/1/1970)
        if ($startDate && $startDate->year !== 1970) {
            $month = $startDate->month;
            $season = match (true) {
                $month >= 1 && $month <= 3 => 'Winter',
                $month >= 4 && $month <= 6 => 'Spring',
                $month >= 7 && $month <= 9 => 'Summer',
                default => 'Fall'
            };
            $season .= ' ' . $startDate->year;
        }

        return [
            'id' => $this->id,
            'type' => $this->type,
            'episode_count' => $this->episode_count === 0 ? null : $this->episode_count,
            'season' => $season,
            'title' => $this->title_main,
            'rating' => $this->rating == 0.00 ? null : $this->rating,
            'picture' => "https://anidb.net/images/main/{$this->picture}"
        ];
    }
}
