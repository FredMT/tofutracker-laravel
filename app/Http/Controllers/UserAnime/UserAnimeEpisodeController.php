<?php

namespace App\Http\Controllers\UserAnime;

use App\Actions\Anime\Plays\DeleteUserAnimePlayAction;
use App\Http\Controllers\Controller;
use App\Models\UserAnime\UserAnimeEpisode;
use App\Pipeline\UserAnimeEpisode\CreateUserAnimeEpisodeAndPlay;
use App\Pipeline\UserAnimeEpisode\CreateUserAnimeEpisodeAnime;
use App\Pipeline\UserAnimeEpisode\CreateUserAnimeEpisodeCollection;
use App\Pipeline\UserAnimeEpisode\EnsureUserAnimeEpisodeLibrary;
use App\Pipeline\UserAnimeEpisode\UpdateUserAnimeEpisodeStatus;
use App\Pipeline\UserAnimeSeason\UpdateUserAnimeCollectionWatchStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class UserAnimeEpisodeController extends Controller
{
    protected DeleteUserAnimePlayAction $deletePlayAction;

    public function __construct(DeleteUserAnimePlayAction $deletePlayAction)
    {
        $this->deletePlayAction = $deletePlayAction;
    }

    /**
     * Store or destroy an anime episode in the user's library.
     */
    public function store(Request $request): RedirectResponse
    {

        try {
            $validated = $request->validate([
                'tvdb_episode_id' => ['required', 'integer', 'exists:anime_episode_mappings,tvdb_episode_id'],
                'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
                'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            ]);

            $existingEpisode = UserAnimeEpisode::query()
                ->where('episode_id', $validated['tvdb_episode_id'])
                ->whereHas('userAnime.collection.userLibrary', function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id);
                })
                ->first();

            if ($existingEpisode) {
                return back()->with([
                    'success' => false,
                    'message' => 'Episode already exists in your library.',
                ]);
            }

            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureUserAnimeEpisodeLibrary::class,
                        CreateUserAnimeEpisodeCollection::class,
                        CreateUserAnimeEpisodeAnime::class,
                        CreateUserAnimeEpisodeAndPlay::class,
                        UpdateUserAnimeEpisodeStatus::class,
                        UpdateUserAnimeCollectionWatchStatus::class,
                    ])
                    ->then(function () {
                        return back()->with([
                            'success' => true,
                            'message' => 'Anime episode added to your library',
                        ]);
                    });
            });
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            \Sentry\captureException($e);
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            \Sentry\captureException($e);
            logger()->error('Failed to add anime episode to library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding anime episode to library.',
            ]);
        }
    }

    /**
     * Delete an anime episode and its related play records from the user's library.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tvdb_episode_id' => ['required', 'integer', 'exists:anime_episode_mappings,tvdb_episode_id'],
        ]);

        try {
            return DB::transaction(function () use ($request, $validated): RedirectResponse {
                $episode = UserAnimeEpisode::query()
                    ->where('episode_id', $validated['tvdb_episode_id'])
                    ->whereHas('userAnime.collection.userLibrary', function ($query) use ($request) {
                        $query->where('user_id', $request->user()->id);
                    })
                    ->firstOrFail();

                if (! $episode) {
                    return back()->with([
                        'success' => false,
                        'message' => 'Episode not found in library.',
                    ]);
                }

                if (Gate::denies('delete-anime-episode', $episode)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this anime episode.');
                }

                // Delete play records
                $this->deletePlayAction->execute($episode);

                $episode->delete();

                return back()->with([
                    'success' => true,
                    'message' => 'Anime episode removed from your library.',
                ]);
            });
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            logger()->error('Failed to remove anime episode from library model not found: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'Episode not found in your library.',
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to remove anime episode from library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing anime episode from library.',
            ]);
        }
    }
}
