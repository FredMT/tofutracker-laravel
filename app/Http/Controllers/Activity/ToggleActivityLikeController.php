<?php

namespace App\Http\Controllers\Activity;

use App\Http\Controllers\Controller;
use App\Models\UserActivity;
use Illuminate\Http\Request;

class ToggleActivityLikeController extends Controller
{
    public function __invoke(Request $request, UserActivity $activity)
    {
        $liked = $activity->toggleLike($request->user()->id);

        return back()->with([
            'liked' => $liked,
            'likesCount' => $activity->likesCount(),
        ]);
    }
}
