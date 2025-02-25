import { WatchStatusSelect } from "@/Components/ContentActions/components/Actions/WatchStatus/Movie/MovieWatchStatusSelect";
import { RateContent } from "@/Components/ContentActions/components/Rating/RateContent";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import ManageCustomList from "./Actions/ManageCustomList/ManageCustomList";
import AddToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary/AddToLibrary";
import RemoveFromLibrary from "@/Components/ContentActions/components/Actions/RemoveFromLibrary/RemoveFromLibrary";

type MoviePageProps = PageProps<{ type: "movie" }>;

/**
 * Component for movie-related actions
 */
export default function MovieActions() {
    const { user_library, auth } = usePage<MoviePageProps>().props;

    const hasLibraryEntry =
        user_library &&
        (user_library.watch_status !== null || user_library.rating !== null);

    return (
        <Stack gap={8} w={"100%"}>
            {hasLibraryEntry ? <RemoveFromLibrary /> : <AddToLibrary />}
            <RateContent />
            {auth.user && <WatchStatusSelect />}
            <ManageCustomList />
        </Stack>
    );
}
