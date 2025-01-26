<?php

namespace App\Http\Controllers\Comment;

use App\Http\Controllers\Controller;
use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\Comment;
use App\Models\Movie;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    use AuthorizesRequests;

    public function index(string $type, string $id)
    {
        $modelClass = match ($type) {
            'movie' => Movie::class,
            'tv' => TvShow::class,
            'tvseason' => TvSeason::class,
            'animemovie' => AnidbAnime::class,
            'animetv' => AnimeMap::class,
            'animeseason' => AnidbAnime::class,
            'user' => User::class,
        };

        $commentable = $modelClass::findOrFail($id);

        $comments = Comment::with(['user', 'votes'])
            ->where('commentable_type', $modelClass)
            ->where('commentable_id', $commentable->id)
            ->treeOf(function ($query) use ($modelClass, $commentable) {
                $query->whereNull('parent_id')
                    ->where('commentable_type', $modelClass)
                    ->where('commentable_id', $commentable->id);
            })
            ->breadthFirst()
            ->orderBy('created_at', 'desc')
            ->get()
            ->toTree();

        return $this->formatComments($comments);
    }

    public function store(Request $request, string $type, string $id)
    {
        $request->validate([
            'body' => 'required|string|min:1|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $modelClass = match ($type) {
            'movie' => Movie::class,
            'tv' => TvShow::class,
            'tvseason' => TvSeason::class,
            'animemovie' => AnidbAnime::class,
            'animetv' => AnimeMap::class,
            'animeseason' => AnidbAnime::class,
            'user' => User::class,
        };

        $commentable = $modelClass::findOrFail($id);

        $comment = $commentable->comments()->create([
            'body' => $request->body,
            'user_id' => $request->user()->id,
            'parent_id' => $request->parent_id,
        ]);

        $comment->votes()->create([
            'user_id' => $request->user()->id,
            'value' => 1,
        ]);

        return response()->json([
            'comment' => [
                'id' => (string) $comment->id,
                'author' => $comment->user?->username,
                'points' => 1,
                'timeAgo' => 'just now',
                'content' => $comment->body,
                'children' => [],
                'isEdited' => false,
                'isDeleted' => false,
            ],
        ]);
    }

    public function update(Request $request, Comment $comment)
    {
        $this->authorize('update', $comment);

        $validated = $request->validate([
            'body' => 'required|string|min:1|max:2000',
        ]);

        $comment->update(['body' => $validated['body']]);

        $comment->refresh();

        return response()->json([
            'id' => (string) $comment->id,
            'author' => $comment->user?->username,
            'points' => $comment->votes->sum('value'),
            'timeAgo' => $comment->updated_at->diffForHumans(now(), CarbonInterface::DIFF_RELATIVE_TO_NOW, true),
            'content' => $comment->body,
            'isEdited' => true,
            'isDeleted' => false,
        ]);
    }

    private function formatComments($comments)
    {
        return $comments->map(function ($comment) {
            return $this->formatComment($comment);
        });
    }

    private function formatComment($comment)
    {
        return [
            'id' => (string) $comment->id,
            'author' => $comment->user?->username,
            'points' => $comment->votes->sum('value'),
            'timeAgo' => $comment->created_at->diffForHumans(),
            'content' => $comment->body,
            'children' => $comment->children->map(fn($child) => $this->formatComment($child)),
            'isEdited' => $comment->user_id !== null && $comment->created_at != $comment->updated_at,
            'isDeleted' => $comment->user_id === null && $comment->deleted_at !== null,
            'direction' => $comment->votes->where('user_id', Auth::id())->first()?->value ?? 0,
        ];
    }

    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);

        // Delete associated votes
        $comment->votes()->delete();

        // Soft delete the comment
        $comment->update([
            'user_id' => null,
            'body' => '[deleted]',
            'deleted_at' => now(),
        ]);

        return response()->json([
            'id' => (string) $comment->id,
            'author' => null,
            'content' => '[deleted]',
            'isEdited' => false,
            'isDeleted' => true,
        ]);
    }
}
