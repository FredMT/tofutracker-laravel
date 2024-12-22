import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AddSeasonToLibrary from "./Actions/AddSeasonToLibrary";
import RemoveSeasonFromLibrary from "./Actions/RemoveSeasonFromLibrary";
import { RateContent } from "./Rating/RateContent";
import { WatchStatusSelect } from "@/Components/ContentActions/components/Actions/WatchStatus";

function TvSeasonActions() {
    const { tvseason, user_library } = usePage<PageProps>().props;
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
            <WatchStatusSelect />
        </Stack>
    );
}

export default TvSeasonActions;
