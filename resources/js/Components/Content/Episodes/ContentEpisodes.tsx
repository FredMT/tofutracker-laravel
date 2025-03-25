import { TvSeason } from "@/types";
import { usePage } from "@inertiajs/react";
import { Divider, Grid, Stack, Title } from "@mantine/core";

import { EpisodeCard } from "./EpisodeCard";

function ContentEpisodes() {
    const { data } = usePage<{ data: TvSeason }>().props;

    return (
        <Stack mb={24}>
            <Divider my={16} />
            <Title order={3}>Episodes</Title>
            <Grid
                type="container"
                breakpoints={{
                    xs: "500px",
                    sm: "500px",
                    md: "700px",
                    lg: "900px",
                    xl: "1024px",
                }}
                gutter={{ base: 12 }}
            >
                {[...data.episodes]
                    .sort((a, b) => a.episode_number - b.episode_number)
                    .map((episode) => (
                        <EpisodeCard
                            episode={episode}
                            key={episode.id}
                            imageSource="tmdb"
                            type="tv"
                        />
                    ))}
            </Grid>
        </Stack>
    );
}

export default ContentEpisodes;
