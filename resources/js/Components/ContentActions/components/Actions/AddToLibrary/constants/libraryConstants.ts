import { ContentType, RouteMap } from "../types/libraryTypes";

// Route names for different content types
export const ROUTE_NAMES: RouteMap = {
    movie: "movie.library.store",
    tv: "tv.library.store",
    "tv.season": "tv.season.library.store",
    "anime.movie": "anime.movie.library.store",
    "anime.tv": "anime.tv.library.store",
    "anime.season": "anime.season.library.store",
};

// Display names for different content types
export const CONTENT_NAMES: RouteMap = {
    movie: "movie",
    tv: "show",
    "tv.season": "season",
    "anime.movie": "anime movie",
    "anime.tv": "anime TV show",
    "anime.season": "anime season",
};

// Custom button text for specific content types
export const BUTTON_TEXTS: Partial<RouteMap> = {
    "tv.season": "Add Season to Library",
};
