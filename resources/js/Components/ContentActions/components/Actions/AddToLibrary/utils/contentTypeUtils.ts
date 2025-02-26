import { ContentType, ContentData } from "../types/libraryTypes";
import { Movie, TvShow, TvSeason } from "@/types";
import { Anime } from "@/types/anime";
import { AnimeSeason } from "@/types/animeseason";

/**
 * Determines the content type based on the page type
 */
export function determineContentType(pageType: string): ContentType | null {
    if (pageType === "movie") {
        return "movie";
    } else if (pageType === "tv") {
        return "tv";
    } else if (pageType === "tvseason") {
        return "tv.season";
    } else if (pageType === "animemovie") {
        return "anime.movie";
    } else if (pageType === "animetv") {
        return "anime.tv";
    } else if (pageType === "animeseason") {
        return "anime.season";
    }

    return null;
}

/**
 * Builds form data based on content type and data
 */
export function buildFormData(
    contentType: ContentType,
    data: ContentData
): Record<string, any> {
    switch (contentType) {
        case "movie":
            const movieData = data as Movie;
            return { movie_id: movieData.id };

        case "tv":
            const tvData = data as TvShow;
            return { show_id: tvData.id };

        case "tv.season":
            const seasonData = data as TvSeason;
            return {
                show_id: seasonData.show_id,
                season_id: seasonData.id,
            };

        case "anime.movie":
            const animeMovieData = data as Anime;
            return {
                anidb_id: animeMovieData.anidb_id,
                map_id: animeMovieData.map_id,
            };

        case "anime.tv":
            const animeTvData = data as Anime;
            return { map_id: animeTvData.map_id };

        case "anime.season":
            const animeSeasonData = data as AnimeSeason;
            return {
                map_id: animeSeasonData.map_id,
                anidb_id: animeSeasonData.id,
            };

        default:
            return {};
    }
}
