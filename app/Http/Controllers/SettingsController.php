<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Auth/Settings');
    }

    public function updateUsername(Request $request)
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:16',
                Rule::unique('users')->ignore(Auth::id()),
                'alpha_dash',
            ],
        ]);

        $user = Auth::user();
        $user->username = $validated['username'];
        $user->save();

        return back()->with('message', 'Username updated successfully');
    }
}
