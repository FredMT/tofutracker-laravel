import {PageProps} from "@/types";
import {usePage} from "@inertiajs/react";

export function useContent() {
    const { type, movie, tv, tvseason, animetv, animemovie, animeseason } =
        usePage<PageProps>().props;
    const contentMap = {
        movie: movie,
        tv: tv,
        tvseason: tvseason,
        animetv: animetv,
        animemovie: animemovie,
        animeseason: animeseason,
    };

    const content = contentMap[type] ?? null;

    return { content, type };
}
