<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TmdbService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        return $request->user()->hasVerifiedEmail()
            ? redirect()->intended(route('me', absolute: false))
            : Inertia::render('Auth/VerifyEmail', [
                'status' => session('status'),
                'backdropImage' => app(TmdbService::class)->getRandomTrendingBackdropImage()
            ]);
    }
}
