<?php

namespace App\Actions\Activity;

use App\Actions\Activity\Handlers\ActivityHandlerInterface;
use App\Actions\Activity\Handlers\AnimeActivityHandler;
use App\Actions\Activity\Handlers\MovieActivityHandler;
use App\Actions\Activity\Handlers\TvActivityHandler;
use App\Models\UserActivity;
use Illuminate\Database\Eloquent\Model;

class CreateUserActivityAction
{
    /**
     * @var ActivityHandlerInterface[]
     */
    private array $handlers;

    public function __construct(array $handlers = [])
    {
        $this->handlers = $handlers;

        // Register default handlers if none provided
        if (empty($handlers)) {
            $this->handlers = [
                new AnimeActivityHandler(),
                new MovieActivityHandler(),
                new TvActivityHandler(),
                // Add more handlers here as needed
            ];
        }
    }

    public function execute(
        int $userId,
        string $activityType,
        Model $subject,
        ?array $metadata = null
    ): UserActivity {
        foreach ($this->handlers as $handler) {
            if ($handler->canHandle($subject)) {
                return $handler->createActivity($userId, $activityType, $subject, $metadata);
            }
        }

        // Default fallback if no handler is found
        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'metadata' => $metadata,
            'description' => 'Activity recorded',
            'occurred_at' => now(),
        ]);
    }

    public function deleteForSubject(Model $subject): void
    {
        foreach ($this->handlers as $handler) {
            if ($handler->canHandle($subject)) {
                $handler->deleteActivity($subject);
                return;
            }
        }
    }
}
