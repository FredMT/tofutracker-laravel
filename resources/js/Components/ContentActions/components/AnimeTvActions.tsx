import { AnimeUserLibrary, Auth } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AnimeTvWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Anime/Tv/AnimeTvWatchStatus";
import AnimeRateContent from "@/Components/ContentActions/components/Actions/Rate/Anime/Shared/AnimeRateContent";
import ManageCustomList from "./Actions/ManageCustomList/ManageCustomList";
import AddToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary/AddToLibrary";
import RemoveFromLibrary from "@/Components/ContentActions/components/Actions/RemoveFromLibrary/RemoveFromLibrary";

/**
 * Component for anime TV show-related actions
 */
export default function AnimeTvActions() {
    const { user_library, auth } = usePage<{
        user_library: AnimeUserLibrary;
        auth: Auth;
    }>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? <RemoveFromLibrary /> : <AddToLibrary />}
            <AnimeRateContent />
            {auth.user && <AnimeTvWatchStatus />}
            <ManageCustomList />
        </Stack>
    );
}
