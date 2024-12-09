import AddToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary";
import RemoveFromLibrary from "@/Components/ContentActions/components/Actions/RemoveFromLibrary";
import { WatchStatusSelect } from "@/Components/ContentActions/components/Actions/WatchStatus";
import { RateContent } from "@/Components/ContentActions/components/Rating/RateContent";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";

export function ContentActions() {
    const { type, user_library } = usePage<PageProps>().props;
    if (!type) return null;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? <RemoveFromLibrary /> : <AddToLibrary />}
            <RateContent />
            <WatchStatusSelect />
        </Stack>
    );
}
