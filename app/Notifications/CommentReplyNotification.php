<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Models\Comment;

class CommentReplyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Get the notification's database type.
     *
     * @return string
     */
    public function databaseType(object $notifiable): string
    {
        return 'reply';
    }

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Comment $reply,
        public Comment $parentComment
    ) {}

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
            'comment_id' => strval($this->parentComment->id),
            'replier_username' => $this->reply->user->username,
            'reply_id' => strval($this->reply->id)
        ];
    }
}
