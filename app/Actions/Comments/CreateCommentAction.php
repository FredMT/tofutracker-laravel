<?php

namespace App\Actions\Comments;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\Comment;
use App\Models\Movie;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\User;
use App\Notifications\CommentReplyNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class CreateCommentAction
{
    public function execute(array $data, string $type, string $id, User $user): array
    {
        $modelClass = $this->getModelClass($type);
        $commentable = $modelClass::findOrFail($id);

        try {
            return DB::transaction(function () use ($data, $commentable, $user) {
                $comment = $this->createComment($data, $commentable, $user);
                $this->createInitialVote($comment, $user);
                $this->notifyParentCommentAuthor($comment, $data['parent_id'] ?? null);

                return $this->formatResponse($comment);
            });
        } catch (\Exception $e) {
            report($e);
            throw new \RuntimeException('Failed to create comment. Please try again.');
        }
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
            'user' => User::class,
            default => throw new ModelNotFoundException("Invalid type: {$type}"),
        };
    }

    private function createComment(array $data, Model $commentable, User $user): Comment
    {
        return $commentable->comments()->create([
            'body' => $data['body'],
            'user_id' => $user->id,
            'parent_id' => $data['parent_id'] ?? null,
        ]);
    }

    private function createInitialVote(Comment $comment, User $user): void
    {
        $comment->votes()->create([
            'user_id' => $user->id,
            'value' => 1,
        ]);
    }

    private function notifyParentCommentAuthor(Comment $comment, ?int $parentId): void
    {
        if ($parentId) {
            $parentComment = Comment::find($parentId);
            if (
                $parentComment && $parentComment->user->id !== $comment->user_id
            ) {
                $parentComment->user->notify(new CommentReplyNotification($comment, $parentComment));
            }
        }
    }

    private function formatResponse(Comment $comment): array
    {
        return [
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
        ];
    }
}
