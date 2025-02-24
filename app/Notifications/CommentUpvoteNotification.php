<?php

namespace App\Notifications;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class CommentUpvoteNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'vote_milestone';
    }

    public function viaQueues()
    {
        return [
            'database' => 'notifications',
        ];
    }

    private const MILESTONE_SCORES = [2, 10, 25, 50, 100, 500, 1000];

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Comment $comment,
        public int $milestone
    ) {}

    /**
     * Determine if the notification should be sent.
     */
    public function shouldSend(object $notifiable, string $channel): bool
    {
        // Only send if it's a milestone score
        if (! in_array($this->milestone, self::MILESTONE_SCORES)) {
            return false;
        }

        // Check if we've already sent a notification for this milestone
        $existingNotification = DB::table('notifications')
            ->where('notifiable_id', $notifiable->id)
            ->where('type', self::class)
            ->whereRaw("(data::jsonb->>'comment_id')::text = ?", [strval($this->comment->id)])
            ->whereRaw("(data::jsonb->>'score_milestone')::text = ?", [strval($this->milestone)])
            ->exists();

        return ! $existingNotification;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'comment_id' => (string) $this->comment->id,
            'score_milestone' => (string) $this->milestone,
        ];
    }
}
