<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserCustomList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserCustomListController extends Controller
{
    public function index(Request $request, string $username): Response
    {
        $user = User::where('username', $username)
            ->firstOrFail();
        $isOwnProfile = $request->user() && $request->user()->id === $user->id;

        $userLists = null;

        $userData = [
            'id' => $user->id,
            'username' => $user->username,
            'created_at' => 'Joined '.$user->created_at->format('F Y'),
            'avatar' => $user->avatar,
            'banner' => $user->banner,
            'bio' => $user->bio,
        ];

        if ($isOwnProfile) {
            $userData['mustVerifyEmail'] = ! $request->user()->hasVerifiedEmail();
            $userLists = $user->customLists()->orderByDesc('created_at')->get();
        } else {
            $userLists = $user->customLists()->where('is_public', true)->orderByDesc('created_at')->get();
        }

        return Inertia::render('UserCustomLists', ['userData' => $userData, 'userLists' => $userLists]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage-custom-list');

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'banner_image' => 'nullable|string|max:255',
                'private_note' => 'nullable|string',
                'is_public' => 'boolean',
            ]);
            $request->user()->customLists()->create($validated);

            return back()->with(['success' => true, 'message' => 'List created successfully.']);
        } catch (\Exception $e) {
            logger()->error($e->getMessage());
            \Sentry\captureException($e);

            return back()->with(['success' => false, 'message' => 'Failed to create list.']);
        }
    }

    public function update(Request $request, string $username, UserCustomList $list)
    {
        Gate::authorize('manage-custom-list', $list);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string|max:255',
            'private_note' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $list->update($validated);

        return back()->with('success', 'List updated successfully.');
    }

    public function destroy(string $username, UserCustomList $list)
    {
        Gate::authorize('manage-custom-list', $list);

        $list->delete();

        return redirect()->route('user.lists.index', ['username' => $username])
            ->with('success', 'List deleted successfully.');
    }
}
