import AddAnimeSeasonToLibrary from "@/Components/ContentActions/components/Actions/AddToLibrary/Anime/Season/AddAnimeSeasonToLibrary";
import AnimeSeasonRateContent from "@/Components/ContentActions/components/Actions/Rate/Anime/Season/AnimeSeasonRateContent";
import RemoveAnimeSeasonFromLibrary from "@/Components/ContentActions/components/Actions/RemoveFromLibrary/Anime/Season/RemoveAnimeSeasonFromLibrary";
import AnimeSeasonWatchStatus from "@/Components/ContentActions/components/Actions/WatchStatus/Tv/Season/AnimeSeasonWatchStatus";
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
