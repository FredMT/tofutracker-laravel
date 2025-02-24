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
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\Movie;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\User;
use Carbon\CarbonInterface;

class CommentController extends Controller
{
    use AuthorizesRequests;

    public function index(string $type, string $id, FetchCommentsAction $fetchCommentsAction)
    {
        try {
            $comments = $fetchCommentsAction->execute($type, $id);
            return $comments;
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

    public function store(Request $request, string $type, string $id, CreateCommentAction $createCommentAction): JsonResponse
    {
        try {
            $validated = $request->validate([
                'body' => 'required|string|min:1|max:2000',
                'parent_id' => 'nullable|exists:comments,id',
            ]);

            $result = $createCommentAction->execute($validated, $type, $id, $request->user());
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

    public function update(Request $request, Comment $comment, UpdateCommentAction $updateCommentAction): JsonResponse
    {
        try {
            $this->authorize('update', $comment);

            $validated = $request->validate([
                'body' => 'required|string|min:1|max:2000',
            ]);

            $result = $updateCommentAction->execute($comment, $validated);
            return response()->json($result);
        } catch (\Exception $e) {
            report($e);
            return response()->json(
                ['error' => 'Failed to update comment'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    private function formatComments($comments)
    {
        return $comments->map(function ($comment) {
            return $this->formatComment($comment);
        });
    }

    private function formatComment($comment)
    {
        return [
            'id' => (string) $comment->id,
            'author' => $comment->user?->username,
            'points' => $comment->votes->sum('value'),
            'timeAgo' => $comment->created_at->diffForHumans(),
            'content' => $comment->body,
            'children' => $comment->children->map(fn($child) => $this->formatComment($child)),
            'isEdited' => $comment->user_id !== null && $comment->created_at != $comment->updated_at,
            'isDeleted' => $comment->user_id === null && $comment->deleted_at !== null,
            'direction' => $comment->votes->where('user_id', Auth::id())->first()?->value ?? 0,
        ];
    }

    public function destroy(Comment $comment, DeleteCommentAction $deleteCommentAction): JsonResponse
    {
        try {
            $this->authorize('delete', $comment);

            $result = $deleteCommentAction->execute($comment);
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
