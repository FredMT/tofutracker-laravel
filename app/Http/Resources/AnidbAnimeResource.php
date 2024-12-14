<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnidbAnimeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'episode_count' => $this->episode_count,
            'startdate' => $this->startdate,
            'enddate' => $this->enddate,
            'title_main' => $this->title_main,
            'homepage' => $this->homepage,
            'description' => $this->cleanDescription($this->description),
            'rating' => $this->rating,
            'rating_count' => $this->rating_count,
            'picture' => $this->picture,
        ];
    }

    /**
     * Clean the description text.
     */
    private function cleanDescription(?string $description): ?string
    {
        if (!$description) {
            return null;
        }

        // Remove URLs and brackets but keep text that was inside brackets
        $description = preg_replace('/http:\/\/anidb\.net\/\w+\s*\[(.*?)\]/U', '$1', $description);

        // Convert newlines to proper line breaks
        $description = str_replace('\n', "\n", $description);

        return $description;
    }
}
