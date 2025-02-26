import {
    ContentType,
    RouteMap,
} from "@/Components/ContentActions/components/Actions/shared/types/libraryTypes";

// Constants
export const ROUTE_NAMES: Record<string, string> = {
    movie: "movie.library.store",
    tv: "tv.library.store",
    "tv.season": "tv.season.library.store",
    "anime.movie": "anime.movie.library.store",
    "anime.tv": "anime.tv.library.store",
    "anime.season": "anime.season.library.store",
};

export const CONTENT_NAMES: Record<string, string> = {
    movie: "movie",
    tv: "show",
    "tv.season": "season",
    "anime.movie": "anime movie",
    "anime.tv": "anime TV show",
    "anime.season": "anime season",
};

export const BUTTON_TEXTS: Record<string, string> = {
    movie: "Add to Library",
    tv: "Add to Library",
    "tv.season": "Add Season to Library",
    "anime.movie": "Add to Library",
    "anime.tv": "Add to Library",
    "anime.season": "Add to Library",
};
