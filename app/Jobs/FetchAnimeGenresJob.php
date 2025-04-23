<?php

namespace App\Jobs;

use App\Actions\AnimesPage\GetAnimeGenresAction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchAnimeGenresJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;

    public $tries = 0;

    public function __construct() {}

    public function handle(GetAnimeGenresAction $action)
    {
        try {
            $action->fetchAndStore();
        } catch (\Throwable $th) {
            logger()->error('Error fetching anime genres: '.$th->getMessage());
            logger()->error($th->getTraceAsString());
        }
    }
}
