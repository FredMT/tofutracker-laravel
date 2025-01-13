<?php

namespace App\Jobs;

use App\Actions\Tv\TvShowActions;
use App\Models\TvSeason;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateTvSeason implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private TvSeason $season,
        private array $data
    ) {}

    public function handle(TvShowActions $actions): void
    {
        try {
            $actions->updateTvSeason($this->season, $this->data);
        } catch (\Exception $e) {
            logger()->error('Failed to update TV season: '.$e->getMessage());
        }
    }
}
