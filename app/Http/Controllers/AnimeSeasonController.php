<?php

namespace App\Http\Controllers;

use App\Actions\Controller\Anime\AnimeSeasonControllerAction;
use App\Http\Controllers\Comment\CommentController;
use App\Models\Anidb\AnidbAnime;
use App\Models\AnimeSchedule;
use App\Models\AnimeScheduleMap;
use App\Repositories\Anime\AnimeSeasonControllerRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AnimeSeasonController extends Controller
{
    public function __construct(
        private AnimeSeasonControllerAction $action,
        private AnimeSeasonControllerRepository $repository,
        private CommentController $commentController
    ) {
        $this->action = $action;
        $this->repository = $repository;
        $this->commentController = $commentController;
    }

    private function getCountdown($seasonId): ?int
    {
        $scheduleId = AnimeScheduleMap::where('anidb_id', $seasonId)
            ->value('animeschedule_id');

        if (! $scheduleId) {
            return null;
        }

        $nextEpisode = AnimeSchedule::where('animeschedule_id', $scheduleId)
            ->futureEpisodes()
            ->orderBy('episode_date')
            ->first();

        return $nextEpisode ? $nextEpisode->episode_date->timestamp : null;
    }

    private function findTmdbIdsForCast(AnidbAnime $anime, array $processedData): array
    {
        if (! $anime->map_id) {
            return $processedData;
        }

        $tmdbModel = $anime->getTmdbModel();
        if (! $tmdbModel) {
            return $processedData;
        }

        $tmdbCast = $tmdbModel->cast;

        // Check if the credits and seiyuu fields exist in the processed data
        if (isset($processedData['credits']['seiyuu']) && is_array($processedData['credits']['seiyuu'])) {
            foreach ($processedData['credits']['seiyuu'] as &$seiyuu) {
                $maxPercentage = 0;
                $matchedId = null;

                // Get all possible name variants for matching
                $seiyuuNameVariants = [
                    $seiyuu['name'],
                    // Reverse first and last name
                    $this->reverseNameOrder($seiyuu['name']),
                    // Remove spaces
                    str_replace(' ', '', $seiyuu['name']),
                ];

                foreach ($tmdbCast as $castMember) {
                    // Get TMDB name variants
                    $tmdbNameVariants = [
                        $castMember['name'],
                        // Reverse first and last name
                        $this->reverseNameOrder($castMember['name']),
                        // Remove spaces
                        str_replace(' ', '', $castMember['name']),
                    ];

                    // Try all combinations of name variants to find the best match
                    foreach ($seiyuuNameVariants as $seiyuuName) {
                        foreach ($tmdbNameVariants as $tmdbName) {
                            similar_text($seiyuuName, $tmdbName, $percentage);

                            // Also check if the names match character-wise (handle name order differences)
                            if ($percentage > 90 && $percentage > $maxPercentage) {
                                $maxPercentage = $percentage;
                                $matchedId = $castMember['id'];
                            }

                            // Check if this is the same character role
                            if (isset($castMember['character']) && isset($seiyuu['characters'])) {
                                $charName = preg_replace('/\s*\(voice\)$/', '', $castMember['character']);
                                if (stripos($charName, $seiyuu['characters']) !== false ||
                                    stripos($seiyuu['characters'], $charName) !== false) {
                                    // Boost matching score for same character
                                    if ($percentage > 75 && $percentage > $maxPercentage) {
                                        $maxPercentage = $percentage;
                                        $matchedId = $castMember['id'];
                                    }
                                }
                            }
                        }
                    }
                }

                if ($matchedId) {
                    // Replace the original id with the tmdb id
                    $seiyuu['id'] = $matchedId;
                }
            }
        }

        return $processedData;
    }

    /**
     * Reverse the order of first and last name
     */
    private function reverseNameOrder(string $name): string
    {
        $parts = explode(' ', $name);
        if (count($parts) >= 2) {
            return $parts[1].' '.$parts[0];
        }

        return $name;
    }

    public function show(Request $request, $accessId, $seasonId): Response
    {
        try {
            $this->action->validateSeasonAccess($accessId, $seasonId);

            $anime = $this->repository->getAnimeWithRelations($seasonId);
            $processedData = $this->action->processAnimeData($anime, $seasonId);

            $userContent = $this->action->getUserContent($request, $seasonId);
            $links = $this->action->generateNavigationLinks($accessId, $seasonId);
            $comments = $this->commentController->index($request, 'animeseason', $seasonId);

            $user = Auth::user();

            $configuration = $user?->configuration->first() ?? (object) [
                'hide_episode_description' => false,
                'hide_character_name' => false,
                'hide_anime_character_picture' => false,
            ];

            $processedData['countdown'] = $this->getCountdown($seasonId);

            return Inertia::render('AnimeSeasonContent', [
                'data' => $processedData,
                'user_library' => $userContent['library'],
                'user_lists' => $userContent['lists'],
                'type' => 'animeseason',
                'links' => $links,
                'comments' => $comments,
                'configuration' => $configuration,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Anime not found');
        } catch (\Exception $e) {
            logger()->error($e);
            abort(500, 'An error occurred while fetching anime data');
        }
    }
}
