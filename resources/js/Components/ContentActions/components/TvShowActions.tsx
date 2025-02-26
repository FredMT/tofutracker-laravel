import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import RemoveShowFromLibrary from "./Actions/RemoveFromLibrary/Tv/RemoveShowFromLibrary";
import { RateContent } from "./Rating/RateContent";
import TvShowWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Tv/TvShowWatchStatus";
import ManageCustomList from "@/Components/ContentActions/components/Actions/ManageCustomList/ManageCustomList";
import AddToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary/AddToLibrary";

function TvShowActions() {
    const { user_library, auth } = usePage<PageProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? <RemoveShowFromLibrary /> : <AddToLibrary />}
            <RateContent />
            {auth.user && <TvShowWatchStatus />}
            <ManageCustomList />
        </Stack>
    );
}

export default TvShowActions;
