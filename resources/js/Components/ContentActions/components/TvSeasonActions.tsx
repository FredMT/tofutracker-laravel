import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AddSeasonToLibrary from "./Actions/AddToLibrary/Tv/Season/AddSeasonToLibrary";
import RemoveSeasonFromLibrary from "./Actions/RemoveFromLibrary/Tv/Season/RemoveSeasonFromLibrary";
import { RateContent } from "./Rating/RateContent";
import { WatchStatusSelect } from "@/Components/ContentActions/components/Actions/WatchStatus/Movie/WatchStatus";

function TvSeasonActions() {
    const { tvseason, user_library, auth } = usePage<PageProps>().props;
    if (!tvseason) return null;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? (
                <>
                    <RemoveSeasonFromLibrary />
                </>
            ) : (
                <AddSeasonToLibrary />
            )}
            <RateContent />
            {auth.user && <WatchStatusSelect />}
        </Stack>
    );
}

export default TvSeasonActions;
