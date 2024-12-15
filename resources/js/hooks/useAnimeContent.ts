import { PageProps } from "@/types";
import { Anime, ShowData, MovieData, TmdbData, AnidbData } from "@/types/anime";
import { usePage } from "@inertiajs/react";

interface AnimeContentReturn {
    content: Anime;
    type: "animetv" | "animemovie";
    isTV: boolean;
    tmdbData: ShowData | MovieData;
    anidbData: AnidbData;
}

export function useAnimeContent(): AnimeContentReturn | null {
    const { type, animetv, animemovie } = usePage<PageProps>().props;

    // Guard for non-anime content types
    if (type !== "animetv" && type !== "animemovie") {
        return null;
    }

    const content = type === "animetv" ? animetv : animemovie;

    // Guard for undefined content
    if (!content) {
        return null;
    }

    const tmdbData = content.tmdbData.data;
    const isTV = tmdbData.media_type === "tv";

    return {
        content,
        type,
        isTV,
        tmdbData,
        anidbData: content.anidbData,
    };
}
