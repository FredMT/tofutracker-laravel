import {Auth, BaseUserLibrary, PageProps, TvSeason} from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import AddSeasonToLibrary from "./Actions/AddToLibrary/Tv/Season/AddSeasonToLibrary";
import RemoveSeasonFromLibrary from "./Actions/RemoveFromLibrary/Tv/Season/RemoveSeasonFromLibrary";
import { RateContent } from "./Rating/RateContent";
import { WatchStatusSelect } from "@/Components/ContentActions/components/Actions/WatchStatus/Movie/WatchStatus";

type TvSeasonActionsProps = {
    data: TvSeason;
    user_library: BaseUserLibrary;
    auth: Auth;
}
function TvSeasonActions() {
    const { data, user_library, auth } = usePage<TvSeasonActionsProps>().props;
    if (!data) return null;

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
