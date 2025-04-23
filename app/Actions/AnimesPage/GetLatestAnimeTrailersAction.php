<?php

namespace App\Actions\AnimesPage;

use App\Models\Anime\AnimeMap;
use Illuminate\Support\Facades\DB;

class GetLatestAnimeTrailersAction
{
    /**
     * Execute the action to get the latest 10 YouTube trailers for anime TV shows with their titles.
     *
     * @return array<int, array<string, mixed>>
     */
    public function execute(): array
    {
        $trailers = DB::table('tmdb_content_videos')
            ->join('tmdb_videos', 'tmdb_content_videos.video_id', '=', 'tmdb_videos.id')
            ->join('anime_maps', function ($join) {
                $join->on('anime_maps.most_common_tmdb_id', '=', 'tmdb_content_videos.content_id')
                    ->where('anime_maps.tmdb_type', '=', 'tv');
            })
            ->where('tmdb_content_videos.content_type', 'App\\Models\\TvShow')
            ->where('tmdb_videos.type', 'Trailer')
            ->where('tmdb_videos.official', true)
            ->where('tmdb_videos.site', 'YouTube')
            ->orderByDesc('tmdb_videos.published_at')
            ->limit(500)
            ->select([
                'tmdb_videos.key as video_key',
                'tmdb_videos.name as video_name',
                'anime_maps.id as anime_map_id',
            ])
            ->get();

        $result = [];
        $seenAnimeMapIds = [];
        foreach ($trailers as $row) {
            if (isset($seenAnimeMapIds[$row->anime_map_id])) {
                continue;
            }
            $animeMap = AnimeMap::find($row->anime_map_id);
            if (! $animeMap) {
                continue;
            }
            $result[] = [
                'id' => $animeMap->id,
                'video_key' => $row->video_key,
                'video_name' => $row->video_name,
                'title' => $animeMap->title,
            ];
            $seenAnimeMapIds[$row->anime_map_id] = true;
            if (count($result) >= 10) {
                break;
            }
        }

        return $result;
    }
}
