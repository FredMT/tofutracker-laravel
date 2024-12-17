<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AnidbAnime;

class AnimeMappingController extends Controller
{
    public function mapAnimeEpisodes(int $anidbid)
    {
        try {
            $anime = AnidbAnime::findOrFail($anidbid);
            return response()->json($anime->mapped_episodes);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
