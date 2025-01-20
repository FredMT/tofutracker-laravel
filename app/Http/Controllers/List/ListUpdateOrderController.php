<?php

namespace App\Http\Controllers\List;

use App\Http\Controllers\Controller;
use App\Models\UserCustomList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ListUpdateOrderController extends Controller
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
                'items.*.sort_order' => ['required', 'integer', 'min:0'],
            ]);

            foreach ($request->items as $item) {
                $list->items()->where('id', $item['id'])->update([
                    'sort_order' => $item['sort_order'],
                ]);
            }

            return back()->with('status', 'List order updated successfully.');
        } catch (\Exception $e) {
            logger()->error('List order update failed: '.$e->getMessage());

            return back()->withErrors(['order' => 'Failed to update list order. Please try again.']);
        }
    }
}
