<?php

namespace App\Actions\Comments;

use App\Models\Comment;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class UpdateCommentAction
{
    public function execute(Comment $comment, array $data): array
    {
        try {
            return DB::transaction(function () use ($comment, $data) {
                $comment->update(['body' => $data['body']]);
                $comment->refresh();

                return $this->formatResponse($comment);
            });
        } catch (\Exception $e) {
            report($e);
            throw new \RuntimeException('Failed to update comment. Please try again.');
        }
    }

    private function formatResponse(Comment $comment): array
    {
        return [
            'id' => (string) $comment->id,
            'author' => $comment->user?->username,
            'points' => $comment->votes->sum('value'),
            'timeAgo' => $comment->updated_at->diffForHumans(now(), CarbonInterface::DIFF_RELATIVE_TO_NOW, true),
            'content' => $comment->body,
            'isEdited' => true,
            'isDeleted' => false,
        ];
    }
}
