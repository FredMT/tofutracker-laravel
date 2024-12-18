import AddToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary";
import RemoveFromLibrary from "@/Components/ContentActions/components/Actions/RemoveFromLibrary";
import { WatchStatusSelect } from "@/Components/ContentActions/components/Actions/WatchStatus";
import { RateContent } from "@/Components/ContentActions/components/Rating/RateContent";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";

export default function MovieActions() {
    const { user_library } = usePage<PageProps>().props;

    const hasLibraryEntry =
        user_library &&
        (user_library.watch_status !== null || user_library.rating !== null);

    return (
        <Stack gap={8} w={"100%"}>
            {hasLibraryEntry ? <RemoveFromLibrary /> : <AddToLibrary />}
            <RateContent />
            <WatchStatusSelect />
        </Stack>
    );
}
