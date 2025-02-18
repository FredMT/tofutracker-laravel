<?php

namespace App\Actions\Comments;

use App\Jobs\ProcessCommentVoteMilestoneJob;
use App\Models\Comment;
use App\Models\User;
use App\Models\Vote;
use Exception;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class UpdateVoteAction
{
    public function execute(array $data, User $user): array
    {
        try {
            return DB::transaction(function () use ($data, $user) {
                $comment = Comment::findOrFail($data['commentId']);

                if ($data['direction'] === 0) {
                    return $this->removeVote($comment, $user);
                }

                return $this->updateOrCreateVote($comment, $user, $data['direction']);
            });
        } catch (Exception $e) {
            report($e);
            throw new RuntimeException('Failed to update vote. Please try again.');
        }
    }

    private function removeVote(Comment $comment, User $user): array
    {
        Vote::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->delete();

        // No need to dispatch job for vote removal
        return ['direction' => 0];
    }

    private function updateOrCreateVote(Comment $comment, User $user, int $direction): array
    {
        $existingVote = Vote::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->first();

        $vote = Vote::updateOrCreate(
            [
                'user_id' => $user->id,
                'comment_id' => $comment->id,
            ],
            ['value' => $direction]
        );

        // Only dispatch job if this is a new vote (not an update)
        if (! $existingVote) {
            ProcessCommentVoteMilestoneJob::dispatch($comment)
                ->onQueue('notifications')
                ->afterCommit();
        }

        return ['direction' => $vote->value];
    }
}
