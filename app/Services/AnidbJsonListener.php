<?php

namespace App\Services;

use JsonStreamingParser\Listener\ListenerInterface;

class AnidbJsonListener implements ListenerInterface
{
    protected array $stack = [];

    protected AnidbService $anidbService;

    protected ?array $currentAnime = null;

    public function __construct(AnidbService $anidbService)
    {
        $this->anidbService = $anidbService;
    }

    public function startDocument(): void
    {
        $this->stack = [];
    }

    public function endDocument(): void
    {
        // Process any remaining anime data
        if (! empty($this->currentAnime)) {
            $this->processAnimeData($this->currentAnime);
        }
    }

    public function startObject(): void
    {
        $this->stack[] = [];
    }

    public function endObject(): void
    {
        $obj = array_pop($this->stack);

        if (isset($obj['anime'])) {
            $animeData = $obj['anime'];

            // Handle single anime object
            $this->processAnimeData($animeData);
        } else {
            if (! empty($this->stack)) {
                $this->addToStack($obj);
            }
        }
    }

    public function startArray(): void
    {
        $this->stack[] = [];
    }

    public function endArray(): void
    {
        $arr = array_pop($this->stack);
        if (! empty($this->stack)) {
            $this->addToStack($arr);
        }
    }

    public function key(string $key): void
    {
        $this->stack[] = $key;
    }

    public function value($value): void
    {
        $this->addToStack($value);
    }

    private function addToStack($value): void
    {
        $count = count($this->stack);
        if ($count === 0) {
            return;
        }
        if (is_array($this->stack[$count - 1])) {
            $this->stack[$count - 1][] = $value;
        } else {
            $key = array_pop($this->stack);
            $this->stack[$count - 2][$key] = $value;
        }
    }

    private function processAnimeData(array $data): void
    {
        try {
            $this->anidbService->storeAnimeData($data);
        } catch (\Exception $e) {
            logger()->error('Error processing anime data: '.$e->getMessage(), [
                'anime_id' => $data['attrs']['id'] ?? 'unknown',
            ]);
        }
    }

    public function whitespace(string $whitespace): void
    {
        // Not needed for our implementation
        logger()->warningdebug('Whitespace: '.$whitespace);
    }
}
