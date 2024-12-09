import { Stack } from "@mantine/core";
import { RateMovie } from "@/Components/ContentActions/components/Rating/RateMovie";
import { usePage } from "@inertiajs/react";
import { MoviePageProps, PageProps } from "@/types";
import RemoveFromLibrary from "@/Components/ContentActions/components/RemoveFromLibrary";
import AddToLibrary from "@/Components/ContentActions/components/AddToLibrary";
import { WatchStatusSelect } from "@/Components/ContentActions/components/WatchStatus";

export function MovieActions() {
    const { user_library } = usePage<PageProps<MoviePageProps>>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? <RemoveFromLibrary /> : <AddToLibrary />}
            <RateMovie />
            <WatchStatusSelect />
        </Stack>
    );
}
