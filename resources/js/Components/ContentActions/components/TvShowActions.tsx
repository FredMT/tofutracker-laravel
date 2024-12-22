import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AddShowToLibrary from "./Actions/AddShowToLibrary";
import RemoveShowFromLibrary from "./Actions/RemoveShowFromLibrary";
import { RateContent } from "./Rating/RateContent";
import TvShowWatchStatus from "@/Components/ContentActions/components/Actions/TvShowWatchStatus";

function TvShowActions() {
    const { user_library } = usePage<PageProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? <RemoveShowFromLibrary /> : <AddShowToLibrary />}
            <RateContent />
            <TvShowWatchStatus />
        </Stack>
    );
}

export default TvShowActions;
