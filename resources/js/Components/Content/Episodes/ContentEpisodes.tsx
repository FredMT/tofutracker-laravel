import ContentEpisodeCard from "@/Components/Content/Episodes/ContentEpisodeCard";
import { TvSeason } from "@/types";
import { Divider, Stack, Title } from "@mantine/core";
import { usePage } from "@inertiajs/react";

function ContentEpisodes() {
    const { data } = usePage<{ data: TvSeason }>().props;
    return (
        <Stack mb={24}>
            <Divider my={16} />
            <Title order={3}>Episodes</Title>
            {[...data.episodes]
                .sort((a, b) => a.episode_number - b.episode_number)
                .map((episode) => (
                    <ContentEpisodeCard
                        episode={episode}
                        key={episode.id}
                        imageSource="tmdb"
                        type="tv"
                    />
                ))}
        </Stack>
    );
}

export default ContentEpisodes;
