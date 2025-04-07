<?php

namespace App\Actions\Comments;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\Comment;
use App\Models\Movie;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class FetchCommentsAction
{
    public function execute(string $type, string $id, ?string $parentId = null, ?string $showCommentId = null): array
    {
        $modelClass = $this->getModelClass($type);
        $commentable = $modelClass::findOrFail($id);

        $commentCount = Comment::where('commentable_type', $modelClass)
            ->where('commentable_id', $commentable->id)
            ->count();

        // If showCommentId is provided but parentId is not, use showCommentId as parentId.. disabled for useractivity
        if ($showCommentId && ! $parentId && $type !== 'useractivity') {
            $parentId = $showCommentId;
        }

        // If parentId is provided, fetch only that specific comment thread
        if ($parentId) {
            $parentComment = Comment::with(['user', 'votes'])
                ->where('commentable_type', $modelClass)
                ->where('commentable_id', $commentable->id)
                ->where('id', $parentId)
                ->first();

            if (! $parentComment) {
                return [];
            }

            $comments = Comment::with(['user', 'votes'])
                ->where('commentable_type', $modelClass)
                ->where('commentable_id', $commentable->id)
                ->treeOf(function ($query) use ($parentComment) {
                    $query->where('id', $parentComment->id);
                })
                ->breadthFirst()
                ->get()
                ->toTree();

            $formattedComments = $this->formatComments($comments);

            return [
                'comments' => $formattedComments->all(),
                'showCommentId' => $showCommentId,
                'commentCount' => $commentCount,
            ];
        }

        // Default behavior: fetch all comments
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

        $formattedComments = $this->formatComments($comments);

        return [
            'comments' => $formattedComments->all(),
            'showCommentId' => $showCommentId,
            'commentCount' => $commentCount,
        ];
    }

    private function getModelClass(string $type): string
    {
        return match ($type) {
            'movie' => Movie::class,
            'tv' => TvShow::class,
            'tvseason' => TvSeason::class,
            'animemovie' => AnidbAnime::class,
            'animetv' => AnimeMap::class,
            'animeseason' => AnidbAnime::class,
            'useractivity' => UserActivity::class,
            default => throw new ModelNotFoundException("Invalid type: {$type}"),
        };
    }

    private function formatComments(Collection $comments): Collection
    {
        return $comments->map(fn ($comment) => $this->formatComment($comment));
    }

    private function formatComment($comment): array
    {
        return [
            'id' => (string) $comment->id,
            'author' => $comment->user?->username,
            'avatar' => $comment->user?->avatar,
            'points' => $comment->votes->sum('value'),
            'content' => $comment->body,
            'created_at' => $comment->created_at->timestamp,
            'updated_at' => $comment->updated_at->timestamp,
            'deleted_at' => $comment->deleted_at?->timestamp,
            'children' => $comment->children->map(fn ($child) => $this->formatComment($child)),
            'direction' => $comment->votes->where('user_id', Auth::id())->first()?->value ?? 0,
        ];
    }
}
