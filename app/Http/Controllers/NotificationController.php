<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function show(Request $request): Response
    {
        $user = Auth::user();

        if (! $user) {
            return to_route('login');
        }

        $notifications = $user->notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'notifiable_type' => $notification->notifiable_type,
                'notifiable_id' => $notification->notifiable_id,
                'data' => $notification->data,
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
                'updated_at' => $notification->updated_at,
            ];
        });

        return Inertia::render('Notifications', [
            'allNotifications' => $notifications,
            'shouldShowMarkAllAsRead' => $user->unreadNotifications->count() > 0,
        ]);
    }

    public function markNotificationAsRead(string $id)
    {
        try {
            $user = Auth::user();
            if (! $user) {
                return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
            }

            $notification = $user->unreadNotifications->firstWhere('id', $id);

            if (! $notification) {
                return response()->json(['success' => false, 'message' => 'Notification not found'], 404);
            }

            $notification->markAsRead();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            logger()->error('Error marking notification as read', ['error' => $e->getMessage()]);
        }
    }

    public function markAllNotificationsAsRead(): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
        }

        if (! $user->unreadNotifications->count() > 0) {
            return response()->json(['success' => false, 'message' => 'No unread notifications'], 400);
        }

        $user->unreadNotifications->markAsRead();

        return response()->json(['success' => true, 'message' => 'All notifications marked as read']);
    }
}
