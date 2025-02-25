<?php

namespace App\Notifications;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
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
        return ['database', 'broadcast'];
    }

    /**
     * Generate the notification link based on commentable type and ID.
     */
    private function generateLink(): string
    {
        $type = strtolower(class_basename($this->reply->commentable_type));
        $url = "/{$type}/{$this->reply->commentable_id}?showCommentId={$this->reply->id}";

        if ($this->parentComment) {
            $url .= "&parentId={$this->parentComment->id}";
        }

        return $url;
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
            'reply_id' => strval($this->reply->id),
            'link' => $this->generateLink(),
            'replier' => [
                'username' => $this->reply->user->username,
                'avatar' => $this->reply->user->avatar,
            ],
            'content' => $this->reply->body,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'comment_id' => strval($this->parentComment->id),
            'reply_id' => strval($this->reply->id),
            'link' => $this->generateLink(),
            'read_at' => null,
            'replier' => [
                'username' => $this->reply->user->username,
                'avatar' => $this->reply->user->avatar,
            ],
            'content' => $this->reply->body,
        ]);
    }
}
