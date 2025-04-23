<?php

namespace App\Http\Controllers\Comment;

use App\Actions\Comments\UpdateVoteAction;
use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

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

    public function destroy(Comment $comment): Response|JsonResponse
    {
        abort_if(! Auth::id(), 401, 'Unauthorized');

        try {

            Vote::where('user_id', Auth::id())
                ->where('comment_id', $comment->id)
                ->delete();

            return response()->noContent();
        } catch (\Exception $e) {
            $this->logError($e);

            return response()->json(
                ['message' => 'Failed to remove vote'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    private function logError(\Throwable $th)
    {
        logger()->error($th->getMessage());
        logger()->error($th->getTraceAsString());
    }
}
