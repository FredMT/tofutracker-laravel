<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserCustomList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class UserCustomListController extends Controller
{
    public function index(string $username)
    {
        $user = User::where('username', $username)->firstOrFail();

        $lists = $user->customLists()
            ->withCount('items')
            ->latest()
            ->paginate(20);

        return Inertia::render('User/Lists/Index', [
            'lists' => $lists,
            'user' => $user
        ]);
    }

    public function show(string $username, UserCustomList $list)
    {
        Gate::authorize('view-custom-list', $list);

        $user = User::where('username', $username)->firstOrFail();

        if ($list->user_id !== $user->id) {
            abort(404);
        }

        return Inertia::render('User/Lists/Show', [
            'list' => $list->load('items.listable'),
            'user' => $user
        ]);
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
