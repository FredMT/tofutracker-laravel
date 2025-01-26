<?php

namespace App\Http\Controllers\Comment;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Movie;
use App\Models\TvShow;
use App\Models\UserActivity;

class CommentController extends Controller
{
    public function index(string $type, string $id)
    {
        $modelClass = match ($type) {
            'movie' => Movie::class,
            'tv' => TvShow::class,
            'user' => UserActivity::class,
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

    private function formatComments($comments)
    {
        return $comments->map(function ($comment) {
            $data = [
                'id' => (string) $comment->id,
                'author' => $comment->author_username,
                'points' => $comment->points,
                'timeAgo' => $comment->time_ago,
                'content' => $comment->body,
            ];

            if ($comment->children->isNotEmpty()) {
                $data['children'] = $this->formatComments($comment->children);
            }

            return $data;
        });
    }
}
