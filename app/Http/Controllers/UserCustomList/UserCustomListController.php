<?php

namespace App\Http\Controllers\UserCustomList;

use App\Actions\Activity\CreateUserActivityAction;
use App\Http\Controllers\Controller;
use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\Movie;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\User;
use App\Models\UserCustomList\UserCustomList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserCustomListController extends Controller
{
    protected CreateUserActivityAction $activityAction;

    public function __construct(CreateUserActivityAction $activityAction)
    {
        $this->activityAction = $activityAction;
    }

    public function index(Request $request, string $username): Response
    {
        $user = User::where('username', $username)
            ->firstOrFail();
        $isOwnProfile = $request->user() && $request->user()->id === $user->id;

        $userLists = $user->customLists()
            ->when(! $isOwnProfile, function ($query) {
                return $query->where('is_public', true);
            })
            ->withCount('items')
            ->with([
                'items:id,listable_type,listable_id,custom_list_id,sort_order',
                'items.listable',
            ])
            ->orderByDesc('created_at');

        if (! $isOwnProfile) {
            $userLists->select(['id', 'title', 'description', 'banner_image', 'created_at', 'updated_at']);
        }

        $userLists = $userLists->get()->map(function ($list) use ($request) {
            $items = $list->items;

            $topItems = $items->sortBy('sort_order')->take(5)->map(function ($item) {
                $poster = null;
                $posterType = 'tmdb';

                switch ($item->listable_type) {
                    case Movie::class:
                    case TvShow::class:
                    case TvSeason::class:
                        $poster = $item->listable?->poster;
                        break;

                    case AnimeMap::class:
                        if ($item->listable) {
                            $tmdbId = $item->listable->most_common_tmdb_id;
                            $tmdbType = $item->listable->tmdb_type;

                            if ($tmdbType === 'movie') {
                                $poster = Movie::find($tmdbId)?->poster;
                            } elseif ($tmdbType === 'tv') {
                                $poster = TvShow::find($tmdbId)?->poster;
                            }
                        }
                        break;

                    case AnidbAnime::class:
                        $poster = $item->listable?->picture;
                        $posterType = 'anidb';
                        break;
                }

                return [
                    'poster_path' => $poster,
                    'poster_type' => $posterType,
                ];
            })->filter(fn($item) => ! is_null($item['poster_path']))->values();

            $movieCount = $items->filter(fn($item) => $item->listable_type === Movie::class)->count();
            $tvCount = $items->filter(
                fn($item) => in_array($item->listable_type, [TvShow::class, TvSeason::class])
            )->count();
            $animeCount = $items->filter(
                fn($item) => in_array($item->listable_type, [AnimeMap::class, AnidbAnime::class])
            )->count();

            return [
                'id' => $list->id,
                'title' => $list->title,
                'description' => $list->description,
                'banner_image' => $list->banner_image,
                'is_public' => $list->is_public,
                'private_note' => $request->user() && $request->user()->id === $list->user_id ? $list->private_note : null,
                'created_at' => $list->created_at,
                'updated_at' => $list->updated_at,
                'counts' => [
                    'total' => $list->items_count ?? $items->count(),
                    'movies' => $movieCount,
                    'tv' => $tvCount,
                    'anime' => $animeCount,
                ],
                'posters' => $topItems,
            ];
        });

        $userData = [
            'id' => $user->id,
            'username' => $user->username,
            'created_at' => 'Joined ' . $user->created_at->format('F Y'),
            'avatar' => $user->avatar,
            'banner' => $user->banner,
            'bio' => $user->bio,
        ];

        if ($isOwnProfile) {
            $userData['mustVerifyEmail'] = ! $request->user()->hasVerifiedEmail();
        }

        return Inertia::render('UserCustomLists', [
            'userData' => $userData,
            'userLists' => $userLists->count() ? $userLists : null,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage-custom-list');

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'banner_image' => 'nullable|string|max:255',
                'private_note' => 'nullable|string',
                'is_public' => 'boolean',
            ]);
            $list = $request->user()->customLists()->create($validated);

            if ($list->is_public) {
                $this->activityAction->execute(
                    $request->user()->id,
                    'custom_list_created',
                    $list
                );
            }

            return back()->with(['success' => true, 'message' => 'List created successfully.']);
        } catch (\Exception $e) {
            logger()->error($e->getMessage());
            \Sentry\captureException($e);

            return back()->with(['success' => false, 'message' => 'Failed to create list.']);
        }
    }

    public function update(Request $request, UserCustomList $list)
    {
        Gate::authorize('manage-custom-list', $list);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string|max:255',
            'private_note' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $list->update($validated);

        return back()->with('success', 'List updated successfully.');
    }

    public function destroy(string $username, UserCustomList $list)
    {
        Gate::authorize('manage-custom-list', $list);

        if ($list->is_public) {
            $this->activityAction->deleteForSubject($list);
        }

        $list->delete();

        return redirect()->route('user.lists.index', ['username' => $username])
            ->with('success', 'List deleted successfully.');
    }
}
