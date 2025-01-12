import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Button, Stack } from "@mantine/core";
import AddShowToLibrary from "./Actions/AddToLibrary/Tv/AddShowToLibrary";
import RemoveShowFromLibrary from "./Actions/RemoveFromLibrary/Tv/RemoveShowFromLibrary";
import { RateContent } from "./Rating/RateContent";
import TvShowWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Tv/TvShowWatchStatus";
import ManageCustomList from "@/Components/ContentActions/components/Actions/ManageCustomList/ManageCustomList";

function TvShowActions() {
    const { user_library, auth } = usePage<PageProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? <RemoveShowFromLibrary /> : <AddShowToLibrary />}
            <RateContent />
            {auth.user && <TvShowWatchStatus />}
            <ManageCustomList />
        </Stack>
    );
}

export default TvShowActions;
