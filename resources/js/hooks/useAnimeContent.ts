import {PageProps} from "@/types";
import {AnidbData, Anime, MovieData, ShowData} from "@/types/anime";
import {usePage} from "@inertiajs/react";

interface AnimeContentReturn {
    content: Anime;
    type: "animetv" | "animemovie";
    tmdbData: ShowData | MovieData;
    anidbData: AnidbData;
}

export function useAnimeContent(): AnimeContentReturn | null {
    const { type, animetv, animemovie } = usePage<PageProps>().props;

    if (type !== "animetv" && type !== "animemovie") {
        return null;
    }

    const content = type === "animetv" ? animetv : animemovie;

    if (!content) {
        return null;
    }

    const tmdbData = content.tmdbData.data;

    return {
        content,
        type,
        tmdbData,
        anidbData: content.anidbData,
    };
}
