import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import RemoveAnimeMovieFromLibrary from "./Actions/RemoveFromLibrary/Anime/Movie/RemoveAnimeMovieFromLibrary";
import AnimeMovieWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Anime/Movie/AnimeMovieWatchStatus";
import AddAnimeTvToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary/Anime/Tv/AddAnimeTvToLibrary";
import AnimeTvWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Anime/Tv/AnimeTvWatchStatus";
import RemoveAnimeTvFromLibrary from "@/Components/ContentActions/components/Actions/RemoveFromLibrary/Anime/Tv/RemoveAnimeTvFromLibrary";
import AnimeRateContent from "@/Components/ContentActions/components/Actions/Rate/Anime/Shared/AnimeRateContent";

export default function AnimeTvActions() {
    const { user_library } = usePage<PageProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? (
                <RemoveAnimeTvFromLibrary />
            ) : (
                <AddAnimeTvToLibrary />
            )}
            <AnimeRateContent />
            <AnimeTvWatchStatus />
        </Stack>
    );
}
