import { AnimeUserLibrary, Auth } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AddAnimeMovieToLibrary from "./Actions/AddToLibrary/Anime/Movie/AddAnimeMovieToLibrary";
import RemoveAnimeMovieFromLibrary from "./Actions/RemoveFromLibrary/Anime/Movie/RemoveAnimeMovieFromLibrary";
import AnimeMovieWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Anime/Movie/AnimeMovieWatchStatus";
import AnimeRateContent from "@/Components/ContentActions/components/Actions/Rate/Anime/Shared/AnimeRateContent";
import ManageCustomList from "./Actions/ManageCustomList/ManageCustomList";

function AnimeMovieActions() {
    const { user_library, auth } = usePage<{
        user_library: AnimeUserLibrary;
        auth: Auth;
    }>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? (
                <RemoveAnimeMovieFromLibrary />
            ) : (
                <AddAnimeMovieToLibrary />
            )}
            <AnimeRateContent />
            {auth.user && <AnimeMovieWatchStatus />}
            <ManageCustomList />
        </Stack>
    );
}

export default AnimeMovieActions;
