import {ContentType} from "@/types";
import {usePage} from "@inertiajs/react";
import MovieActions from "./components/MovieActions";
import TvShowActions from "./components/TvShowActions";
import TvSeasonActions from "./components/TvSeasonActions";
import AnimeMovieActions from "./components/AnimeMovieActions";
import AnimeTvActions from "@/Components/ContentActions/components/AnimeTvActions";
import AnimeSeasonActions from "@/Components/ContentActions/components/AnimeSeasonActions";

function ContentActions() {
    const { type } = usePage<{type: ContentType}>().props;

    switch (type) {
        case "movie":
            return <MovieActions />;
        case "tv":
            return <TvShowActions />;
        case "tvseason":
            return <TvSeasonActions />;
        case "animemovie":
            return <AnimeMovieActions />;
        case "animetv":
            return <AnimeTvActions />;
        case "animeseason":
            return <AnimeSeasonActions />;
        default:
            return null;
    }
}

export default ContentActions;
