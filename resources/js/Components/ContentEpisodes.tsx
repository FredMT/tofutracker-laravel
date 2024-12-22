import ContentEpisodeCard from "@/Components/ContentEpisodeCard";
import { useContent } from "@/hooks/useContent";
import { TvSeason } from "@/types";
import { Divider, Stack, Title } from "@mantine/core";

function ContentEpisodes() {
    const { content, type } = useContent();
    if (!content || type !== "tvseason") return null;
    const season = content as TvSeason;
    return (
        <Stack mb={24}>
            <Divider my={16} />
            <Title order={3}>Episodes</Title>
            {season.episodes.map((episode) => (
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
