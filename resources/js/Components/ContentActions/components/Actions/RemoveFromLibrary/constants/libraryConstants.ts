import {
    ContentType,
    RouteMap,
} from "@/Components/ContentActions/components/Actions/shared/types/libraryTypes";

/**
 * Route names for removing different content types from library
 */
export const ROUTE_NAMES: RouteMap = {
    movie: "movie.library.destroy",
    tv: "tv.library.destroy",
    "tv.season": "tv.season.library.destroy",
    "anime.movie": "anime.movie.library.destroy",
    "anime.tv": "anime.tv.library.destroy",
    "anime.season": "anime.season.library.destroy",
};

/**
 * Content names for different content types
 */
export const CONTENT_NAMES: Record<ContentType, string> = {
    movie: "movie",
    tv: "show",
    "tv.season": "season",
    "anime.movie": "anime movie",
    "anime.tv": "anime TV show",
    "anime.season": "anime season",
};

/**
 * Button texts for different content types
 */
export const BUTTON_TEXTS: Record<ContentType, string> = {
    movie: "Remove from Library",
    tv: "Remove from Library",
    "tv.season": "Remove from Library",
    "anime.movie": "Remove from Library",
    "anime.tv": "Remove from Library",
    "anime.season": "Remove from Library",
};

/**
 * Modal titles for different content types
 */
export const MODAL_TITLES: Record<ContentType, string> = {
    movie: "Remove Movie?",
    tv: "Remove Show?",
    "tv.season": "Remove Season?",
    "anime.movie": "Remove from Library?",
    "anime.tv": "Remove from Library?",
    "anime.season": "Remove from Library?",
};

/**
 * Modal contents for different content types
 */
export const MODAL_CONTENTS: Record<ContentType, string> = {
    movie: "Are you sure you want to remove this movie from your library?",
    tv: "Are you sure you want to remove this show from your library? This will also remove all your seasons and episodes!",
    "tv.season":
        "Are you sure you want to remove this season from your library?",
    "anime.movie":
        "Are you sure you want to remove this anime movie from your library?",
    "anime.tv":
        "Are you sure you want to remove this anime collection from your library? This will also remove all your episode activity for this content.",
    "anime.season":
        "Are you sure you want to remove this anime season from your library? This will also remove all your episode activity for this content.",
};
