<?php

namespace App\Http\Controllers\Comment;

use App\Actions\Comments\UpdateVoteAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class VoteController extends Controller
{
    public function __construct(
        private readonly UpdateVoteAction $updateVoteAction
    ) {}

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'commentId' => 'required|exists:comments,id',
                'direction' => ['required', Rule::in([1, -1, 0])],
            ]);

            $result = $this->updateVoteAction->execute($validated, $request->user());

            return response()->json($result);
        } catch (\Exception $e) {
            report($e);

            return response()->json(
                ['error' => 'Failed to update vote'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
