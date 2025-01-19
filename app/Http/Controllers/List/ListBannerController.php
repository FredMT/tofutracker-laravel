<?php

namespace App\Http\Controllers\List;

use App\Http\Controllers\Controller;
use App\Models\UserCustomList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ListBannerController extends Controller
{
    public function __invoke(Request $request, UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $request->validate([
                'banner' => ['required', 'file', 'image', 'max:6144'], // 6MB max
            ]);

            if (! $request->hasFile('banner')) {
                return back()->withErrors(['banner' => 'No file was uploaded.']);
            }

            try {
                Storage::disk('spaces')->deleteDirectory("listBanners/{$list->id}");
            } catch (\Exception $e) {
                logger()->warning('Failed to delete old banner directory: '.$e->getMessage());
            }

            $file = $request->file('banner');
            if (! $file->isValid()) {
                return back()->withErrors(['banner' => 'File upload failed.']);
            }

            $path = $file->storeAs(
                "listBanners/{$list->id}",
                $file->hashName(),
                [
                    'disk' => 'spaces',
                    'options' => [
                        'ContentType' => $file->getMimeType(),
                    ],
                ]
            );

            if (! $path) {
                return back()->withErrors(['banner' => 'Failed to store file.']);
            }

            $list->update([
                'banner_image' => $path,
                'banner_type' => 'custom',
            ]);

            return back()->with('status', 'Banner updated successfully.');
        } catch (\Exception $e) {
            logger()->error('Banner upload failed: '.$e->getMessage());

            return back()->withErrors(['banner' => 'Failed to upload banner. Please try again.']);
        }
    }
} 