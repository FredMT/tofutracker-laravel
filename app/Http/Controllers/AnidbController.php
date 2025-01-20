<?php

namespace App\Http\Controllers;

use App\Jobs\ImportAnimeDataJob;
use Illuminate\Http\JsonResponse;

class AnidbController extends Controller
{
    public function importAnimeData(): JsonResponse
    {
        ImportAnimeDataJob::dispatch()->onQueue('imports');

        return response()->json([
            'message' => 'Import job has been queued successfully',
            'note' => 'Check the job status in your queue worker logs',
        ]);
    }
}
