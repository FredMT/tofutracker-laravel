import AnimeSeasonRateContent from "@/Components/ContentActions/components/Actions/Rate/Anime/Season/AnimeSeasonRateContent";
import AnimeSeasonWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Tv/Season/AnimeSeasonWatchStatus";
import { AnimeSeasonUserLibrary, Auth } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import ManageCustomList from "./Actions/ManageCustomList/ManageCustomList";
import AddToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary/AddToLibrary";
import RemoveFromLibrary from "@/Components/ContentActions/components/Actions/RemoveFromLibrary/RemoveFromLibrary";

type AnimeSeasonActionsProps = {
    user_library: AnimeSeasonUserLibrary;
    auth: Auth;
};

/**
 * Component for anime season-related actions
 */
export default function AnimeSeasonActions() {
    const { user_library, auth } = usePage<AnimeSeasonActionsProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? <RemoveFromLibrary /> : <AddToLibrary />}
            <AnimeSeasonRateContent />
            {auth.user && <AnimeSeasonWatchStatus />}
            <ManageCustomList />
        </Stack>
    );
}
