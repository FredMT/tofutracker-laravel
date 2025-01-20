<?php

namespace App\Http\Controllers\List;

use App\Http\Controllers\Controller;
use App\Models\UserCustomList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ListBannerRemoveController extends Controller
{
    public function __invoke(UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            if ($list->banner_type === 'custom') {
                try {
                    Storage::disk('spaces')->deleteDirectory("listBanners/{$list->id}");
                } catch (\Exception $e) {
                    logger()->warning('Failed to delete banner directory: '.$e->getMessage());
                }
            }

            $list->update([
                'banner_image' => null,
                'banner_type' => 'custom',
            ]);

            return back()->with('status', 'Banner removed successfully.');
        } catch (\Exception $e) {
            logger()->error('Banner removal failed: '.$e->getMessage());

            return back()->withErrors(['banner' => 'Failed to remove banner. Please try again.']);
        }
    }
}
