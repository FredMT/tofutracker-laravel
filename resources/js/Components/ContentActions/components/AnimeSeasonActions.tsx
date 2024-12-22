import AddAnimeSeasonToLibrary from "@/Components/ContentActions/components/Actions/AddAnimeSeasonToLibrary";
import AnimeSeasonWatchStatus from "@/Components/ContentActions/components/Actions/AnimeSeasonWatchStatus";
import RemoveAnimeSeasonFromLibrary from "@/Components/ContentActions/components/Actions/RemoveAnimeSeasonFromLibrary";
import AnimeSeasonRateContent from "@/Components/ContentActions/components/Rating/AnimeSeasonRateContent";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";

export default function AnimeSeasonActions() {
    const { user_library } = usePage<PageProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? (
                <RemoveAnimeSeasonFromLibrary />
            ) : (
                <AddAnimeSeasonToLibrary />
            )}
            <AnimeSeasonRateContent />
            <AnimeSeasonWatchStatus />
        </Stack>
    );
}
