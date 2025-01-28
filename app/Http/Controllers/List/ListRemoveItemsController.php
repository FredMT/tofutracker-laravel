<?php

namespace App\Http\Controllers\List;

use App\Actions\Activity\CreateUserActivityAction;
use App\Http\Controllers\Controller;
use App\Models\UserCustomList\UserCustomList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ListRemoveItemsController extends Controller
{
    protected CreateUserActivityAction $activityAction;

    public function __construct(CreateUserActivityAction $activityAction)
    {
        $this->activityAction = $activityAction;
    }

    public function __invoke(Request $request, UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $request->validate([
                'items' => ['required', 'array'],
                'items.*.id' => ['required', 'integer', 'exists:user_custom_list_items,id'],
            ]);

            $itemsToDelete = $list->items()
                ->with('customList')
                ->whereIn('id', collect($request->items)->pluck('id'))
                ->get();

            if ($list->is_public) {
                foreach ($itemsToDelete as $item) {
                    $this->activityAction->deleteForSubject($item);
                }
            }

            $list->items()->whereIn('id', $itemsToDelete->pluck('id'))->delete();

            $list->items()
                ->orderBy('sort_order')
                ->get()
                ->each(function ($item, $index) {
                    $item->update(['sort_order' => $index + 1]);
                });

            return back()->with('status', 'Items removed successfully.');
        } catch (\Exception $e) {
            logger()->error('List items removal failed: '.$e->getMessage());
            \Sentry\captureException($e);

            return back()->withErrors(['items' => 'Failed to remove items. Please try again.']);
        }
    }
}
