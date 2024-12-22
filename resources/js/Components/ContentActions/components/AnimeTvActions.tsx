import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import RemoveAnimeMovieFromLibrary from "./Actions/RemoveAnimeMovieFromLibrary";
import { AnimeRateContent } from "@/Components/ContentActions/components/Rating/AnimeRateContent";
import AnimeMovieWatchStatus from "@/Components/ContentActions/components/Actions/AnimeMovieWatchStatus";
import AddAnimeTvToLibrary from "@/Components/ContentActions/components/Actions/AddAnimeTvToLibrary";
import RemoveAnimeTvFromLibrary from "@/Components/ContentActions/components/Actions/RemoveAnimeTvFromLibrary";
import AnimeTvWatchStatus from "@/Components/ContentActions/components/Actions/AnimeTvWatchStatus";

export default function AnimeTvActions() {
    const { user_library } = usePage<PageProps>().props;

    return (
        <Stack gap={8} w={"100%"}>
            {user_library ? (
                <RemoveAnimeTvFromLibrary />
            ) : (
                <AddAnimeTvToLibrary />
            )}
            <AnimeRateContent />
            <AnimeTvWatchStatus />
        </Stack>
    );
}
