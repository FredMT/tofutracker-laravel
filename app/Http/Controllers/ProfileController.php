<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Update the user's avatar.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        logger()->info('Request data:', $request->all());
        logger()->info('Files:', $request->allFiles());

        try {
            $validated = $request->validate([
                'avatar' => ['required', 'file', 'image', 'max:3072'], // 5MB max
            ]);

            if (! $request->hasFile('avatar')) {
                logger()->error('No file in request');

                return back()->withErrors(['avatar' => 'No file was uploaded.']);
            }

            $file = $request->file('avatar');
            if (! $file->isValid()) {
                logger()->error('Invalid file');

                return back()->withErrors(['avatar' => 'File upload failed.']);
            }

            $path = $file->storeAs(
                'avatars',
                $file->hashName(),
                [
                    'disk' => 'spaces',
                    'options' => [
                        'ContentType' => $file->getMimeType(),
                    ],
                ]
            );

            if (! $path) {
                logger()->error('Failed to store file');

                return back()->withErrors(['avatar' => 'Failed to store file.']);
            }

            // Delete old avatar if exists
            if ($request->user()->avatar) {
                try {
                    Storage::disk('spaces')->delete($request->user()->avatar);
                } catch (\Exception $e) {
                    logger()->warning('Failed to delete old avatar: '.$e->getMessage());
                }
            }

            $request->user()->update([
                'avatar' => $path,
            ]);

            return back()->with('status', 'Avatar updated successfully.');
        } catch (\Exception $e) {
            logger()->error('Avatar upload failed: '.$e->getMessage());

            return back()->withErrors(['avatar' => 'Failed to upload avatar. Please try again.']);
        }
    }

    /**
     * Update the user's banner.
     */
    public function updateBanner(Request $request): RedirectResponse
    {
        logger()->info('Request data:', $request->all());
        logger()->info('Files:', $request->allFiles());

        try {
            $validated = $request->validate([
                'banner' => ['required', 'file', 'image', 'max:6144'], // 3MB max
            ]);

            if (! $request->hasFile('banner')) {
                logger()->error('No file in request');

                return back()->withErrors(['banner' => 'No file was uploaded.']);
            }

            $file = $request->file('banner');
            if (! $file->isValid()) {
                logger()->error('Invalid file');

                return back()->withErrors(['banner' => 'File upload failed.']);
            }

            $path = $file->storeAs(
                'banners',
                $file->hashName(),
                [
                    'disk' => 'spaces',
                    'options' => [
                        'ContentType' => $file->getMimeType(),
                    ],
                ]
            );

            if (! $path) {
                logger()->error('Failed to store file');

                return back()->withErrors(['banner' => 'Failed to store file.']);
            }

            // Delete old banner if exists
            if ($request->user()->banner) {
                try {
                    Storage::disk('spaces')->delete($request->user()->banner);
                } catch (\Exception $e) {
                    logger()->warning('Failed to delete old banner: '.$e->getMessage());
                }
            }

            $request->user()->update([
                'banner' => $path,
            ]);

            return back()->with('status', 'Banner updated successfully.');
        } catch (\Exception $e) {
            logger()->error('Banner upload failed: '.$e->getMessage());

            return back()->withErrors(['banner' => 'Failed to upload banner. Please try again.']);
        }
    }

    /**
     * Update the user's bio.
     */
    public function updateBio(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bio' => ['nullable', 'string', 'max:160'],
        ]);

        $request->user()->update([
            'bio' => $validated['bio'] ?: null,
        ]);

        return back()->with('status', 'Bio updated successfully.');
    }
}
