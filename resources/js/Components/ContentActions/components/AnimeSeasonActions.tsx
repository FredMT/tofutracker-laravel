import AddAnimeSeasonToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary/Anime/Season/AddAnimeSeasonToLibrary";
import AnimeSeasonRateContent from "@/Components/ContentActions/components/Actions/Rate/Anime/Season/AnimeSeasonRateContent";
import RemoveAnimeSeasonFromLibrary from "@/Components/ContentActions/components/Actions/RemoveFromLibrary/Anime/Season/RemoveAnimeSeasonFromLibrary";
import AnimeSeasonWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Tv/Season/AnimeSeasonWatchStatus";
import { AnimeSeasonUserLibrary, Auth, PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import ManageCustomList from "./Actions/ManageCustomList/ManageCustomList";

type AnimeSeasonActionsProps = {
    user_library: AnimeSeasonUserLibrary;
    auth: Auth;
};
export default function AnimeSeasonActions() {
    const { user_library, auth } = usePage<AnimeSeasonActionsProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? (
                <RemoveAnimeSeasonFromLibrary />
            ) : (
                <AddAnimeSeasonToLibrary />
            )}
            <AnimeSeasonRateContent />
            {auth.user && <AnimeSeasonWatchStatus />}
            <ManageCustomList />
        </Stack>
    );
}
