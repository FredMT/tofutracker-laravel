<?php

namespace App\Services;

use Exception;

class AnidbUdpService
{
    private $socket;

    private const SERVER = 'api.anidb.net';

    private const PORT = 9000;

    private const RETRY_DELAY = 2; // seconds

    private const MAX_RETRIES = 3;

    public function __construct()
    {
        $this->initializeSocket();
    }

    private function initializeSocket(): void
    {
        $this->socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
        if ($this->socket === false) {
            throw new Exception('Failed to create socket: '.socket_strerror(socket_last_error()));
        }

        // Bind to a specific local port (required by AniDB)
        $localPort = config('services.anidb.local_port', 4321);
        if (! socket_bind($this->socket, '0.0.0.0', $localPort)) {
            throw new Exception('Failed to bind socket: '.socket_strerror(socket_last_error()));
        }
    }

    public function getUpdatedAnime(int $days = 2): array
    {
        try {
            $command = sprintf('UPDATED entity=1&age=%d', $days);
            $response = $this->sendCommand($command);

            if (str_starts_with($response, '243')) {
                // Parse the response
                $parts = explode('|', substr($response, 4));

                return [
                    'entity' => (int) $parts[0],
                    'total_count' => (int) $parts[1],
                    'last_update' => (int) $parts[2],
                    'anime_ids' => explode(',', $parts[3] ?? ''),
                ];
            }

            if (str_starts_with($response, '343')) {
                return ['message' => 'No updates found'];
            }

            throw new Exception("Unexpected response: $response");
        } catch (Exception $e) {
            logger()->error('AniDB UDP API Error: '.$e->getMessage());
            throw $e;
        }
    }

    private function sendCommand(string $command, int $retries = 0): string
    {
        try {
            socket_sendto($this->socket, $command, strlen($command), 0, self::SERVER, self::PORT);

            $response = '';
            $from = '';
            $port = 0;

            // Set timeout for receiving response
            socket_set_option($this->socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => 30, 'usec' => 0]);

            if (socket_recvfrom($this->socket, $response, 1400, 0, $from, $port) === false) {
                throw new Exception('Failed to receive response: '.socket_strerror(socket_last_error()));
            }

            return trim($response);
        } catch (Exception $e) {
            if ($retries < self::MAX_RETRIES) {
                sleep(self::RETRY_DELAY * ($retries + 1));

                return $this->sendCommand($command, $retries + 1);
            }
            throw $e;
        }
    }

    public function __destruct()
    {
        if ($this->socket) {
            socket_close($this->socket);
        }
    }
}
