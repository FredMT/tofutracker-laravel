import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";

export function useContent() {
    const { type, movie, tv, tvseason, animetv, animemovie, animeseason } =
        usePage<PageProps>().props;

    const content =
        type === "movie"
            ? movie
            : type === "tv"
            ? tv
            : type === "tvseason"
            ? tvseason
            : type === "animetv"
            ? animetv
            : type === "animemovie"
            ? animemovie
            : type === "animeseason"
            ? animeseason
            : null;

    return { content, type };
}
