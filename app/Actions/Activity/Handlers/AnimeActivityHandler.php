<?php

namespace App\Actions\Activity\Handlers;

use App\Models\UserActivity;
use App\Models\UserAnimeEpisode;
use Illuminate\Database\Eloquent\Model;

class AnimeActivityHandler implements ActivityHandlerInterface
{
    /**
     * @var ActivityHandlerInterface[]
     */
    private array $handlers;

    public function __construct()
    {
        $this->handlers = [
            new AnimeEpisodeActivityHandler(),
            new AnimePlayActivityHandler(),
            // Add more anime-specific handlers here as needed
        ];
    }

    public function canHandle(Model $subject): bool
    {
        return collect($this->handlers)->contains(fn($handler) => $handler->canHandle($subject));
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        foreach ($this->handlers as $handler) {
            if ($handler->canHandle($subject)) {
                return $handler->createActivity($userId, $activityType, $subject, $metadata);
            }
        }

        throw new \InvalidArgumentException('No handler found for the given subject');
    }

    public function deleteActivity(Model $subject): void
    {
        foreach ($this->handlers as $handler) {
            if ($handler->canHandle($subject)) {
                $handler->deleteActivity($subject);
                return;
            }
        }
    }
}
