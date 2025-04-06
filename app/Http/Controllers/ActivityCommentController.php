<?php

namespace App\Http\Controllers;

use App\Actions\Comments\CreateCommentAction;
use App\Actions\Comments\DeleteCommentAction;
use App\Actions\Comments\FetchCommentsAction;
use App\Actions\Comments\UpdateCommentAction;
use App\Models\Activity;
use App\Models\Comment;
use App\Models\UserActivity;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ActivityCommentController extends Controller
{
    public function index(UserActivity $activity, FetchCommentsAction $fetchCommentsAction): JsonResponse
    {
        try {
            $userId = Auth::id();
            $result = $fetchCommentsAction->execute($activity, $userId);

            return response()->json([
                'success' => true,
                'comments' => $result['comments'],
                'commentCount' => $result['commentCount'],
                'message' => 'Comments fetched successfully.'
            ]);
        } catch (\Throwable $th) {
            $this->logError($th);

            return response()->json(['success' => false, 'message' => 'Failed to fetch comments.'], 500);
        }
    }

    public function store(Request $request, UserActivity $activity, CreateCommentAction $createCommentAction): JsonResponse
    {
        try {
            $validated = $request->validate([
                'content' => 'required|string|max:2000',
                'parent_id' => 'nullable|exists:comments,id',
                'replying_to' => 'nullable|string',
            ]);

            $user = Auth::user();
            if (! $user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
            }

            $result = $createCommentAction->execute(
                $activity,
                $user,
                $validated['content'],
                $validated['parent_id'] ?? null,
                $validated['replying_to'] ?? null
            );

            return response()->json([
                'success' => true,
                'comment' => $result['comment'],
                'commentCount' => $result['commentCount'],
                'message' => 'Comment posted successfully.'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Failed to post comment.'], 500);
        }
    }

    public function update(Request $request, UserActivity $activity, Comment $comment, UpdateCommentAction $updateCommentAction): JsonResponse
    {
        if (Auth::id() !== $comment->user_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        try {
            $validated = $request->validate([
                'content' => 'required|string|max:2000',
            ]);

            $updatedComment = $updateCommentAction->execute($comment, $validated['content']);

            return response()->json([
                'success' => true,
                'comment' => $updatedComment,
                'message' => 'Comment updated successfully.'
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Failed to update comment.'], 500);
        }
    }

    public function destroy(UserActivity $activity, Comment $comment, DeleteCommentAction $deleteCommentAction): JsonResponse
    {
        if (Auth::id() !== $comment->user_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        try {
            $deleteCommentAction->execute($comment);

            $activity->loadCount('comments');

            return response()->json([
                'success' => true,
                'commentCount' => $activity->comments_count,
                'message' => 'Comment deleted successfully.'
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Failed to delete comment.'], 500);
        }
    }

    public function like(UserActivity $activity, Comment $comment): JsonResponse
    {
        $userId = Auth::id();
        if (! $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        try {
            Vote::updateOrCreate(
                ['user_id' => $userId, 'comment_id' => $comment->id],
                ['value' => 1]
            );

            $comment->load('votes');

            return response()->json([
                'success' => true,
                'message' => 'Comment liked.',
                'points' => $comment->points,
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Failed to like comment.'], 500);
        }
    }

    public function unlike(UserActivity $activity, Comment $comment): JsonResponse
    {
        $userId = Auth::id();
        if (! $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        try {
            Vote::where('user_id', $userId)->where('comment_id', $comment->id)->delete();

            $comment->load('votes');

            return response()->json([
                'success' => true,
                'message' => 'Comment unliked.',
                'points' => $comment->points,
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Failed to unlike comment.'], 500);
        }
    }

    private function logError(\Throwable $th)
    {
        $this->logger->error($th->getMessage());
        $this->logger->error($th->getTraceAsString());
    }
}

