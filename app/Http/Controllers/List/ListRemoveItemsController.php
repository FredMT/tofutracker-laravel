<?php

namespace App\Http\Controllers\List;

use App\Http\Controllers\Controller;
use App\Models\UserCustomList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ListRemoveItemsController extends Controller
{
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

            $list->items()->whereIn('id', collect($request->items)->pluck('id'))->delete();

            $remainingItems = $list->items()
                ->orderBy('sort_order')
                ->pluck('id')
                ->values()
                ->toArray();

            $cases = [];
            $ids = [];
            foreach ($remainingItems as $index => $id) {
                $cases[] = "WHEN {$id} THEN ".($index + 1);
                $ids[] = $id;
            }

            if (! empty($cases)) {
                $list->items()
                    ->whereIn('id', $ids)
                    ->update([
                        'sort_order' => DB::raw('CASE id '.implode(' ', $cases).' END'),
                    ]);
            }

            return back()->with('status', 'Items removed successfully.');
        } catch (\Exception $e) {
            logger()->error('List items removal failed: '.$e->getMessage());

            return back()->withErrors(['items' => 'Failed to remove items. Please try again.']);
        }
    }
}
