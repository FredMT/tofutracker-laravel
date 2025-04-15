<?php

// config/providers.php

return [

    /*
    |--------------------------------------------------------------------------
    | Provider Merge Map
    |--------------------------------------------------------------------------
    |
    | Defines how streaming providers are merged and managed within the system.
    | It includes a merge map that specifies how related provider IDs are consolidated into a
    | main provider ID, along with standalone provider IDs that are not merged.
    |
    | Shows from each 'related_provider_id' will be added to the 'main_provider_id',
    | ensuring uniqueness. The related provider entries will then be removed
    | from the final list.
    |
    | Example: Merge Apple TV Plus Amazon Channel (2243) and
    |          Roku Apple TV Channel ( hypothetical 123) into Apple TV (337).
    |          337 => [2243, 123],
    |
    | These providers are not merged into any other provider and remain independent in the final list:
    |
    | Hulu (ID: 15)
    | Spectrum (ID: 486)
    | Adult Swim (ID: 318)
    | Rakuten (ID: 344)
    | Youtube Premium (ID: 188)
    */

    'merge_map' => [

        // Apple TV
        350 => [
            2061, 2037, 2045, 2054, 1855, 2243, 2034, 2048, 2052, 2041,
            2142, 2049, 1852, 2033, 2060, 2057, 1853, 2053, 2047, 1854,
            2, 2055, 642, 2107, 2059, 2058, 2050, 2036, 2044, 2040,
            2056, 2042, 2038, 2035, 2039,
        ],

        // Netflix
        8 => [
            175, 1796,
        ],

        // Max
        1899 => [
            384, 1733, 1825, 2284, 2307, 2374,
        ],

        // Amazon
        9 => [
            10, 119, 196, 197, 199, 201, 202, 204, 205, 262,
            263, 285, 286, 287, 289, 290, 291, 293, 294, 295,
            296, 334, 343, 528, 533, 582, 583, 584, 587, 588,
            589, 595, 596, 597, 598, 599, 600, 602, 603, 604,
            605, 606, 607, 608, 609, 610, 611, 612, 613, 678,
            679, 680, 681, 683, 684, 685, 686, 687, 688, 689,
            690, 693, 705, 706, 707, 708, 1706, 1707, 1708, 1709,
            1710, 1711, 1712, 1713, 1726, 1727, 1728, 1729, 1730, 1732,
            1733, 1734, 1735, 1736, 1737, 1738, 1739, 1740, 1741, 1742,
            1743, 1744, 1745, 1746, 1747, 1757, 1788, 1794, 1805, 1806,
            1811, 1825, 1866, 1887, 1888, 1889, 1890, 1891, 1892, 1893,
            1894, 1895, 1896, 1897, 1898, 1968, 1989, 2063, 2064, 2065,
            2071, 2073, 2074, 2075, 2089, 2100, 2106, 2108, 2134, 2141,
            2156, 2157, 2158, 2159, 2160, 2161, 2162, 2163, 2164, 2165,
            2166, 2167, 2168, 2169, 2170, 2171, 2172, 2173, 2174, 2176,
            2177, 2178, 2179, 2180, 2181, 2182, 2183, 2184, 2185, 2229,
            2231, 2233, 2243, 2244, 2245, 2246, 2247, 2248, 2249, 2250,
            2252, 2253, 2254, 2255, 2256, 2257, 2258, 2259, 2260, 2261,
            2262, 2263, 2264, 2265, 2266, 2267, 2268, 2269, 2270, 2271,
            2272, 2273, 2274, 2275, 2277, 2278, 2279, 2280, 2287, 2288,
            2289, 2290, 2291, 2292, 2293, 2294, 2295, 2296, 2297, 2298,
            2299, 2315, 2318, 2325, 2326, 2327, 2356, 2357, 2358, 2359,
            2362, 2367, 2371, 2374, 2376, 2377, 2378, 2379, 2380, 2381,
            2382, 2388, 2389, 2392, 2395, 2399, 2400, 2403, 2404, 2405,
            2406,
        ],

        // Disney
        337 => [
            508,
        ],

        // Paramount
        531 => [
            582, 633, 1770, 1853, 2303, 2304,
        ],

        // AMC
        526 => [80, 352, 528, 635, 1854],

        // Peacock
        387 => [386],

        // Crave
        230 => [305],

        // WOW - Germany
        30 => [546],

        // Hotstar - India
        122 => [2336],

        // Sky
        29 => [210, 130, 321, 1773],

        // Hulu
        15,

        // Spectrum
        486,

        // Adult Swim
        318,

        // Rakuten
        344,

        // Youtube Premium
        188,

        // Okko - Russia
        115,

        // Amediateka - Russia
        116,

        // Peacock
        387 => [386],

    ],

    /*
    |--------------------------------------------------------------------------
    | Standalone Providers (Reference)
    |--------------------------------------------------------------------------
    | A list of provider IDs not typically merged. Any ID not in merge_map
    | values is technically standalone.
    */
    'standalone_providers' => [
        // Hulu
        15,

        // Spectrum
        486,

        // Adult Swim
        318,

        // Rakuten
        344,

        // Youtube Premium
        188,

        // Okko - Russia
        115,

        // Amediateka - Russia
        116,
    ],

    /*
    |--------------------------------------------------------------------------
    | Link Prefixes Map
    |--------------------------------------------------------------------------
    | Maps provider IDs (main or related) to an array of unique URL prefixes
    | associated with that specific provider for the scraping job.
    */
    'link_prefixes' => [

        // --- Amazon Group ---
        9 => ['https://watch.amazon.', 'https://www.amazon.', 'https://primevideo.com', 'https://app.primevideo.com'],

        // --- Max Group ---
        1899 => ['https://play.max.com', 'https://video.unext.jp', 'https://play.hbomax.com'],

        // --- Sky Group ---
        29 => ['https://skygo.sky.it', 'https://www.sky.de', 'https://www.sky.com', 'https://www.sky.at', 'https://skyx.sky.at', 'https://show.sky.ch'], // Sky

        // WOW DE
        30 => ['https://wowtv.de'],

        // SkyShowtime
        1773 => ['https://www.skyshowtime.com'],

        // Crave
        23 => ['https://www.crave.ca'],

        // Hotstar
        122 => ['https://www.hotstar.com'],

        // --- Netflix Group ---
        8 => ['https://www.netflix.com'],

        // --- Disney Group ---
        337 => ['https://www.disneyplus.com', 'https://disneyplus.bn5x.net'],

        // --- Apple---
        350 => ['https://tv.apple.com'],

        // --- Paramount+ Group ---
        531 => ['https://www.paramountplus.com'],

        // Hulu
        15 => ['https://www.hulu.com'],

        // Youtube Premium
        188 => ['https://www.youtube.com/watch', 'https://www.youtube.com/movie'],

        // Okko - Russia
        115 => ['https://okko.tv'],

        // Amediateka - Russia
        116 => ['https://www.amediateka.ru'],

        // Peacock
        387 => ['https://www.peacocktv.com'],

    ],

    /*
    |--------------------------------------------------------------------------
    | Blacklisted Link Prefixes
    |--------------------------------------------------------------------------
    | Defines URL prefixes that should be *ignored* by the scraping job, even
    | if they match a provider's domain. Useful for excluding links to
    | help pages, account settings, sign-up flows, generic homepages etc.
    | Structure can be Provider ID => [prefixes] or just a flat array of prefixes.
    | Using Provider ID keys can make it more organized.
    */
    'blacklisted_link_prefixes' => [
        // Generic (apply to any provider if matched)
        // Use a specific key like 0 or -1 for generic blacklist
        // Example using key 0 for generic blacklist:
        0 => [
            'https://skyx.sky.at/',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | URL Normalization Patterns
    |--------------------------------------------------------------------------
    | Defines patterns for normalizing affiliate/tracking URLs to their base provider URLs.
    | Each entry contains:
    | - pattern: The regex pattern to match the URL
    | - extract: The regex pattern to extract the actual content URL
    | - provider_id: The associated provider ID
    | - transform: (optional) A transformation rule to apply to the extracted URL
    */
    'url_normalization_patterns' => [
        [
            'pattern' => '#^https?://disneyplus\.bn5x\.net/c/\d+/\d+/\d+\?u=([^&]+)#i',
            'extract' => 'u=([^&]+)',
            'provider_id' => 337,
            'transform' => [
                'from' => ['%3A', '%2F'],
                'to' => [':', '/'],
            ],
        ],
    ],

];
