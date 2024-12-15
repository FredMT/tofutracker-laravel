import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";

export function useContent() {
    const { type, movie, tv, tvseason, animetv, animemovie } =
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
            : null;

    return { content, type };
}
