<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\PendingRequest;

class TvdbService
{
    private PendingRequest $client;
    private string $baseUrl = 'https://api4.thetvdb.com/v4';

    public function __construct()
    {
        $this->client = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.tvdb.token'),
            'Accept' => 'application/json',
        ])->baseUrl($this->baseUrl);
    }

    public function getEpisodes(int $seriesId)
    {
        $allEpisodes = [];
        $nextUrl = "/series/{$seriesId}/episodes/default/eng";

        while ($nextUrl) {
            $response = $this->client->get($nextUrl);
            $data = json_decode($response->body());

            $allEpisodes = array_merge($allEpisodes, $data->data->episodes);

            $nextUrl = $data->links->next;
        }
        return $allEpisodes;
    }
}
