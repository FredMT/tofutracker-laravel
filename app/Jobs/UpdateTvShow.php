<?php

namespace App\Jobs;

use App\Actions\Tv\TvShowActions;
use App\Models\TvShow;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateTvShow implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private TvShow $show,
        private array $data
    ) {}

    public function handle(TvShowActions $actions): void
    {

        $actions->updateTvShow($this->show, $this->data);
    }
}
