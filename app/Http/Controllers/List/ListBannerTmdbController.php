<?php

namespace App\Http\Controllers\List;

use App\Http\Controllers\Controller;
use App\Models\UserCustomList\UserCustomList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ListBannerTmdbController extends Controller
{
    public function __invoke(Request $request, UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $request->validate([
                'file_path' => ['required', 'string'],
            ]);

            // Clean up any existing custom banners when switching to TMDB
            if ($list->banner_type === 'custom') {
                try {
                    Storage::disk('spaces')->deleteDirectory("listBanners/{$list->id}");
                } catch (\Exception $e) {
                    logger()->warning('Failed to delete old banner directory: '.$e->getMessage());
                }
            }

            $list->update([
                'banner_image' => $request->file_path,
                'banner_type' => 'tmdb',
            ]);

            return back()->with('status', 'Banner updated successfully.');
        } catch (\Exception $e) {
            logger()->error('TMDB banner update failed: '.$e->getMessage());

            return back()->withErrors(['banner' => 'Failed to update banner. Please try again.']);
        }
    }
}
