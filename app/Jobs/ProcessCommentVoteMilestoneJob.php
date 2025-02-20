<?php

namespace App\Jobs;

use App\Models\Comment;
use App\Models\Vote;
use App\Notifications\CommentUpvoteNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessCommentVoteMilestoneJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const array VOTE_MILESTONES = [2, 10, 25, 50, 100, 500, 1000];

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly Comment $comment
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $totalScore = Vote::where('comment_id', $this->comment->id)->sum('value');

        // Find the highest milestone reached
        $milestone = collect(self::VOTE_MILESTONES)
            ->filter(fn($milestone) => $totalScore >= $milestone)
            ->last();

        // Only update if milestone changed
        if ($milestone === $this->comment->vote_milestone) {
            return;
        }

        // Update milestone in database
        $this->comment->update(['vote_milestone' => $milestone]);

        // Only notify if it's a new milestone and higher than the previous one
        if ($milestone && (!$this->comment->vote_milestone || $milestone >= $this->comment->vote_milestone)) {
            $this->notifyMilestoneReached($milestone);
        }
    }

    private function notifyMilestoneReached(int $milestone): void
    {
        if (!$this->comment->user) {
            return;
        }

        $existingNotification = $this->comment->user
            ->notifications()
            ->where('type', CommentUpvoteNotification::class)
            ->whereRaw("(data::jsonb->>'comment_id')::text = ?", [strval($this->comment->id)])
            ->whereNull('read_at')
            ->first();

        if ($existingNotification) {
            // Update existing unread notification
            $existingNotification->update([
                'data' => [
                    'type' => 'vote_milestone',
                    'comment_id' => (string) $this->comment->id,
                    'score_milestone' => (string) $milestone,
                ],
            ]);
        } else {
            // Create new notification
            $this->comment->user->notify(new CommentUpvoteNotification($this->comment, $milestone));
        }
    }
}
