<?php

namespace App\Notifications;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class CommentReplyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'reply';
    }

    public function viaQueues()
    {
        return [
            'database' => 'notifications',
        ];
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
            'reply_id' => strval($this->reply->id),
        ];
    }
}
