<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class CheckAnimeMapping
{
    /**
     * Handle an incoming request and check if id is anime and if so, redirect.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $id = $request->route('id');

        $mapping = cache()->remember("anime_mapping_{$id}", now()->addWeek(), function () use ($id) {
            $response = Http::get("https://arm.haglund.dev/api/v2/themoviedb?id={$id}");
            return $response->json();
        });

        if (!empty($mapping)) {
            return redirect()->to("/anime/{$id}");
        }

        return $next($request);
    }
}
