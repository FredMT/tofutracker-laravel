<?php

namespace App\Http\Controllers;

use App\Actions\AnimesPage\GetTrendingAnimesAction;
use Illuminate\Http\JsonResponse;

class AnimesController extends Controller
{
    private GetTrendingAnimesAction $getTrendingAnimesAction;

    public function __construct(
        GetTrendingAnimesAction $getTrendingAnimesAction
    ) {
        $this->getTrendingAnimesAction = $getTrendingAnimesAction;
    }

    public function index(): JsonResponse
    {
        $result = $this->getTrendingAnimesAction->execute();
        return response()->json($result);
    }
}
