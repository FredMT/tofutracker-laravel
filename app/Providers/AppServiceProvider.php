<?php

namespace App\Providers;

use App\Models\User;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserAnime\UserAnimeEpisode;
use App\Models\UserCustomList\UserCustomList;
use App\Models\UserLibrary;
use App\Models\UserMovie\UserMovie;
use App\Models\UserTv\UserTvSeason;
use App\Models\UserTv\UserTvShow;
use Illuminate\Auth\Access\Response;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Model::preventLazyLoading();

        Gate::define('rate-movie', function (User $user, ?UserMovie $userMovie = null) {
            if (! $userMovie) {
                return Response::allow();
            }

            return $user->id === $userMovie->user_id
                ? Response::allow()
                : Response::deny('You do not own this movie.');
        });

        Gate::define('delete-tv-show', function (User $user, UserTvShow $userShow) {
            return $user->id === $userShow->user_id
                ? Response::allow()
                : Response::deny('You do not own this TV show.');
        });

        Gate::define('rate-tv-show', function (User $user, ?UserTvShow $userShow = null) {
            if (! $userShow) {
                return Response::allow();
            }

            return $user->id === $userShow->user_id
                ? Response::allow()
                : Response::deny('You do not own this TV show.');
        });

        Gate::define('update-tv-show-status', function (User $user, ?UserTvShow $userShow = null) {
            if (! $userShow) {
                return Response::allow();
            }

            return $user->id === $userShow->user_id
                ? Response::allow()
                : Response::deny('You do not own this TV show.');
        });

        Gate::define('manage-library-entry', function (User $user, UserLibrary $entry) {
            return $user->is($entry->user)
                ? Response::allow()
                : Response::deny('You do not own this library entry.');
        });

        Gate::define('update-season-watch-status', function (User $user, ?UserTvSeason $userSeason = null) {
            // If season doesn't exist yet, allow creating
            if (! $userSeason) {
                return Response::allow();
            }

            // If season exists, check ownership
            return $user->id === $userSeason->user_id
                ? Response::allow()
                : Response::deny('You do not own this season.');
        });

        Gate::define('delete-anime', function ($user, ?UserAnime $userAnime = null) {
            if (! $userAnime) {
                return Response::deny('Anime not found in your library.');
            }

            return $userAnime->collection->userLibrary->user_id === $user->id
                ? Response::allow()
                : Response::deny('You do not own this anime.');
        });

        Gate::define('rate-anime', function (User $user, ?UserAnime $userAnime = null) {
            if (! $userAnime) {
                return Response::allow();
            }

            return $userAnime->collection->userLibrary->user_id === $user->id
                ? Response::allow()
                : Response::deny('You do not own this anime.');
        });

        Gate::define('update-anime', function (User $user, ?UserAnime $userAnime = null) {
            if (! $userAnime) {
                return Response::allow();
            }

            return $userAnime->collection->userLibrary->user_id === $user->id
                ? Response::allow()
                : Response::deny('You do not own this anime.');
        });

        Gate::define('delete-anime-collection', function (User $user, ?UserAnimeCollection $collection = null) {
            if (! $collection) {
                return Response::deny('Collection not found in your library.');
            }

            return $collection->userLibrary->user_id === $user->id
                ? Response::allow()
                : Response::deny('You do not own this collection.');
        });

        Gate::define('rate-anime-collection', function (User $user, ?UserAnimeCollection $collection = null) {
            if (! $collection) {
                return Response::allow();
            }

            return $collection->userLibrary->user_id === $user->id
                ? Response::allow()
                : Response::deny('You do not own this collection.');
        });

        Gate::define('update-anime-collection-status', function (User $user, ?UserAnimeCollection $collection = null) {
            if (! $collection) {
                return Response::allow();
            }

            return $collection->userLibrary->user_id === $user->id
                ? Response::allow()
                : Response::deny('You do not own this collection.');
        });

        Gate::define('delete-anime-season', function (User $user, ?UserAnime $season = null) {
            if (! $season) {
                return Response::deny('Season not found in your library.');
            }

            return $season->collection->userLibrary->user_id === $user->id
                ? Response::allow()
                : Response::deny('You do not own this season.');
        });

        Gate::define('delete-anime-episode', function (User $user, UserAnimeEpisode $episode) {
            return $user->id === $episode->userAnime->collection->userLibrary->user_id;
        });

        Gate::define('manage-custom-list', function (User $user, ?UserCustomList $list = null) {
            if (! $list && $user->hasVerifiedEmail()) {
                return Response::allow();
            }

            return $user->id === $list->user_id
                ? Response::allow()
                : Response::deny('You do not own this list.');
        });

        Gate::define('manage-custom-list-item', function (User $user, ?UserCustomList $list = null) {
            if (! $list) {
                return Response::deny('List not found.');
            }

            return $user->id === $list->user_id
                ? Response::allow()
                : Response::deny('You do not own this list.');
        });

        Gate::define('view-custom-list', function (?User $user, UserCustomList $list) {
            if ($list->is_public) {
                return Response::allow();
            }

            return $user && $user->id === $list->user_id
                ? Response::allow()
                : Response::deny('This list is private.');
        });

        // Define a direct gate for superuser check
        Gate::define('superuser', function (User $user) {
            return $user->id === 1;
        });
    }

}
