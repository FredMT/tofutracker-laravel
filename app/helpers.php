<?php

if (! function_exists('seconds_until')) {
    /**
     * Calculate the number of seconds until a specified date/time.
     *
     * @param  string  $until  A parsable date/time string (e.g., 'tomorrow 8 am')
     * @return int
     *
     * @throws \InvalidArgumentException
     */
    function seconds_until($until)
    {
        try {
            $untilTime = now()->parse($until);
            $ttl = now()->diffInSeconds($untilTime);

            if ($ttl <= 0) {
                throw new \InvalidArgumentException("The 'until' time must be in the future.");
            }

            return $ttl;
        } catch (\Exception $e) {
            throw new \InvalidArgumentException("Invalid 'until' time format: {$until}.");
        }
    }
}
