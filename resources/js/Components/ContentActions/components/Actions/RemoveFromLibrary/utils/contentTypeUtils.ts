import { ContentType } from "../types/libraryTypes";

/**
 * Determines the content type based on the type string from the page props
 */
export function determineContentType(type: string): ContentType {
    switch (type) {
        case "movie":
            return "movie";
        case "tv":
            return "tv";
        case "tvseason":
            return "tv.season";
        case "animemovie":
            return "anime.movie";
        case "animetv":
            return "anime.tv";
        case "animeseason":
            return "anime.season";
        default:
            return "movie"; // Default to movie if type is unknown
    }
}

/**
 * Builds form data based on content type and data
 */
export function buildFormData(
    contentType: ContentType,
    data: any
): Record<string, any> {
    switch (contentType) {
        case "movie":
            return {
                movie_id: data.id,
            };
        case "tv":
            return {
                show_id: data.id,
            };
        case "tv.season":
            return {
                show_id: data.show_id,
                season_id: data.id,
            };
        case "anime.movie":
            return {
                anidb_id: data.anidb_id,
                map_id: data.map_id,
            };
        case "anime.tv":
            return {
                map_id: data.map_id,
                anidb_id: data.anidb_id,
            };
        case "anime.season":
            return {
                anidb_id: data.id,
            };
        default:
            return {};
    }
}
