<?php

namespace App\Http\Controllers\Comment;

use App\Actions\Comments\CreateCommentAction;
use App\Actions\Comments\DeleteCommentAction;
use App\Actions\Comments\FetchCommentsAction;
use App\Actions\Comments\UpdateCommentAction;
use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CommentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FetchCommentsAction $fetchCommentsAction,
        private readonly CreateCommentAction $createCommentAction,
        private readonly UpdateCommentAction $updateCommentAction,
        private readonly DeleteCommentAction $deleteCommentAction
    ) {}

    public function index(string $type, string $id)
    {
        try {
            return $this->fetchCommentsAction->execute($type, $id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Resource not found'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            report($e);

            return response()->json(
                ['error' => 'Failed to fetch comments'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function store(Request $request, string $type, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'body' => 'required|string|min:1|max:2000',
                'parent_id' => 'nullable|exists:comments,id',
            ]);

            $result = $this->createCommentAction->execute($validated, $type, $id, $request->user());

            return response()->json($result, Response::HTTP_CREATED);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Resource not found'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            report($e);

            return response()->json(
                ['error' => 'Failed to create comment'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function update(Request $request, Comment $comment): JsonResponse
    {
        try {
            $this->authorize('update', $comment);

            $validated = $request->validate([
                'body' => 'required|string|min:1|max:2000',
            ]);

            $result = $this->updateCommentAction->execute($comment, $validated);

            return response()->json($result);
        } catch (\Exception $e) {
            report($e);

            return response()->json(
                ['error' => 'Failed to update comment'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function destroy(Comment $comment): JsonResponse
    {
        try {
            $this->authorize('delete', $comment);

            $result = $this->deleteCommentAction->execute($comment);

            return response()->json($result);
        } catch (\Exception $e) {
            report($e);

            return response()->json(
                ['error' => 'Failed to delete comment'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
