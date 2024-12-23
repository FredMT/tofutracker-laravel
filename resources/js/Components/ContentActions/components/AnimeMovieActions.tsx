import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AddAnimeMovieToLibrary from "./Actions/AddToLibrary/Anime/Movie/AddAnimeMovieToLibrary";
import RemoveAnimeMovieFromLibrary from "./Actions/RemoveFromLibrary/Anime/Movie/RemoveAnimeMovieFromLibrary";
import AnimeMovieWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Anime/Movie/AnimeMovieWatchStatus";
import AnimeRateContent from "@/Components/ContentActions/components/Actions/Rate/Anime/Shared/AnimeRateContent";

function AnimeMovieActions() {
    const { user_library } = usePage<PageProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? (
                <RemoveAnimeMovieFromLibrary />
            ) : (
                <AddAnimeMovieToLibrary />
            )}
            <AnimeRateContent />
            <AnimeMovieWatchStatus />
        </Stack>
    );
}

export default AnimeMovieActions;
