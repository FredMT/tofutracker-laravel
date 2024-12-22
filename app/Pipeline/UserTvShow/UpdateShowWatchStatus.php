<?php

namespace App\Pipeline\UserTvShow;

use App\Enums\WatchStatus;
use Closure;

class UpdateShowWatchStatus
{
    public function handle(array $payload, Closure $next)
    {
        $userShow = $payload['user_show'];
        $watchStatus = WatchStatus::from($payload['validated']['watch_status']);

        // Prevent updating to same status
        if ($userShow->watch_status === $watchStatus) {
            return back()->with([
                'success' => false,
                'message' => "Show already has watch status of {$watchStatus->value}",
            ]);
        }

        $userShow->update(['watch_status' => $watchStatus]);
        $payload['watch_status'] = $watchStatus;

        return $next($payload);
    }
}
