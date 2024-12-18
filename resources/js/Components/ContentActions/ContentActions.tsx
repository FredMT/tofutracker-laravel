import MovieActions from "@/Components/ContentActions/components/MovieActions";
import TvSeasonActions from "@/Components/ContentActions/components/TvSeasonActions";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";

export function ContentActions() {
    const { type } = usePage<PageProps>().props;
    if (!type) return null;

    switch (type) {
        case "movie":
            return <MovieActions />;
        case "tvseason":
            return <TvSeasonActions />;
        default:
            return null;
    }
}
