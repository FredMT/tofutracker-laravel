import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AddShowToLibrary from "./Actions/AddToLibrary/Tv/AddShowToLibrary";
import RemoveShowFromLibrary from "./Actions/RemoveFromLibrary/Tv/RemoveShowFromLibrary";
import { RateContent } from "./Rating/RateContent";
import TvShowWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Tv/TvShowWatchStatus";

function TvShowActions() {
    const { user_library, auth } = usePage<PageProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? <RemoveShowFromLibrary /> : <AddShowToLibrary />}
            <RateContent />
            {auth.user && <TvShowWatchStatus />}
        </Stack>
    );
}

export default TvShowActions;
