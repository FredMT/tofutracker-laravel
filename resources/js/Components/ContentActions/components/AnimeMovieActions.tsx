import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AddAnimeMovieToLibrary from "./Actions/AddAnimeMovieToLibrary";
import RemoveAnimeMovieFromLibrary from "./Actions/RemoveAnimeMovieFromLibrary";
import { AnimeRateContent } from "@/Components/ContentActions/components/Rating/AnimeRateContent";
import AnimeMovieWatchStatus from "@/Components/ContentActions/components/Actions/AnimeMovieWatchStatus";

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
