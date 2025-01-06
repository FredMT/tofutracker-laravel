import { useAnimeContent } from "@/hooks/useAnimeContent";
import { BannerImage } from "@/Components/Content/Shared/Regular/BannerImage";
import { usePage } from "@inertiajs/react";
import { AnimeSeason } from "@/types/animeseason";
import { Anime } from "@/types/anime";
import { AnimeContentDataType, AnimeType } from "@/types";

function isAnimeSeason(data: Anime | AnimeSeason): data is AnimeSeason {
    return "title_main" in data;
}

function isAnime(data: Anime | AnimeSeason): data is Anime {
    return "tmdbData" in data;
}

export function BannerImageContainer() {
    const { data, type } = usePage<{
        data: Anime | AnimeSeason;
        type: AnimeType;
    }>().props;

    if (type === "animeseason" && isAnimeSeason(data)) {
        return (
            <BannerImage
                title={data.title_main}
                backdrop_path={data.backdrop_path}
                logo_path={data.logo_path}
                genres={[]}
                height={540}
            />
        );
    }

    if ((type === "animetv" || type === "animemovie") && isAnime(data)) {
        return (
            <BannerImage
                title={data.tmdbData.data.title}
                backdrop_path={data.tmdbData.data.backdrop_path}
                logo_path={data.tmdbData.data.logo_path}
                genres={data.tmdbData.data.genres}
                height={540}
            />
        );
    }

    return null;
}
