<?php

namespace App\Actions\Comments;

use App\Models\Comment;
use Illuminate\Support\Facades\DB;

class DeleteCommentAction
{
    public function execute(Comment $comment): array
    {
        try {
            return DB::transaction(function () use ($comment) {
                // Delete associated votes
                $comment->votes()->delete();

                // Soft delete the comment
                $comment->update([
                    'user_id' => null,
                    'body' => '[deleted]',
                    'deleted_at' => now(),
                ]);

                return $this->formatResponse($comment);
            });
        } catch (\Exception $e) {
            report($e);
            throw new \RuntimeException('Failed to delete comment. Please try again.');
        }
    }

    private function formatResponse(Comment $comment): array
    {
        return [
            'id' => (string) $comment->id,
            'author' => null,
            'content' => '[deleted]',
            'isEdited' => false,
            'isDeleted' => true,
        ];
    }
}
