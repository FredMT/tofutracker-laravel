import { Auth, BaseUserLibrary, TvSeason } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import RemoveSeasonFromLibrary from "./Actions/RemoveFromLibrary/Tv/Season/RemoveSeasonFromLibrary";
import { RateContent } from "./Rating/RateContent";
import { WatchStatusSelect } from "@/Components/ContentActions/components/Actions/WatchStatus/Movie/MovieWatchStatusSelect";
import ManageCustomList from "./Actions/ManageCustomList/ManageCustomList";
import AddToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary/AddToLibrary";

type TvSeasonActionsProps = {
    data: TvSeason;
    user_library: BaseUserLibrary;
    auth: Auth;
};
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
                <AddToLibrary />
            )}
            <RateContent />
            {auth.user && <WatchStatusSelect />}
            <ManageCustomList />
        </Stack>
    );
}

export default TvSeasonActions;
