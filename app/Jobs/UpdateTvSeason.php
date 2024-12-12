<?php

namespace App\Jobs;

use App\Models\TvSeason;
use App\Actions\Tv\TvShowActions;
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
        $actions->updateTvSeason($this->season, $this->data);
    }
}
