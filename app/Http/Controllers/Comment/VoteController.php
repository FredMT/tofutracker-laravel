<?php

namespace App\Http\Controllers\Comment;

use App\Http\Controllers\Controller;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VoteController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'commentId' => 'required|exists:comments,id',
                'direction' => ['required', Rule::in([1, -1, 0])],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid vote direction'], 422);
        }

        try {
            if ($validated['direction'] === 0) {
                Vote::where('user_id', $request->user()->id)
                    ->where('comment_id', $validated['commentId'])
                    ->delete();

                return response()->json(['direction' => 0]);
            }

            $vote = Vote::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'comment_id' => $validated['commentId'],
                ],
                ['value' => $validated['direction']]
            );

            return response()->json(['direction' => $vote->value]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update vote'], 500);
        }
    }
}
