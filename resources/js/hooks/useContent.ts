import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";

export function useContent() {
    const { type, movie, tv, tvseason } = usePage<PageProps>().props;

    const content =
        type === "movie"
            ? movie
            : type === "tv"
            ? tv
            : type === "tvseason"
            ? tvseason
            : null;

    return { content, type };
}
