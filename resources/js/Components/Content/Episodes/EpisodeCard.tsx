import { Episode } from "@/types";
import {
    AspectRatio,
    Badge,
    Grid,
    Group,
    Image,
    Overlay,
    Paper,
    Spoiler,
    Stack,
    Text,
    Title,
} from "@mantine/core";

import { Calendar, Clock } from "lucide-react";
import AnimeEpisodeActions from "./AnimeEpisodeActions";
import EpisodeActions from "./EpisodeActions";

export function EpisodeCard({
    episode,
    imageSource,
    type,
}: {
    episode: Episode;
    imageSource: "tmdb" | "tvdb";
    type: "anime" | "tv";
}) {
    const STILL_PATH =
        imageSource === "tmdb"
            ? "https://image.tmdb.org/t/p/original"
            : "https://artworks.thetvdb.com";
    return (
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Paper p={0} withBorder={false} mih={"378px"}>
                <AspectRatio ratio={16 / 9} mx="auto" pos="relative">
                    <Image
                        src={`${STILL_PATH}${episode.still_path}`}
                        fit="cover"
                        loading="lazy"
                        decoding="async"
                        radius="md"
                        mah={200}
                        fallbackSrc={`data:image/svg+xml,${encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="220">
                                        <rect width="100%" height="100%" fill="#f0f0f0"/>
                                        <text x="50%" y="50%" text-anchor="middle">${`Episode ${episode.episode_number}: ${episode.name}`}</text>
                                    </svg>`
                        )}`}
                    />
                    <Overlay
                        gradient="linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0) 100%)"
                        opacity={0.85}
                        radius="md"
                        mah={200}
                    >
                        <div className="absolute bottom-2 left-2">
                            <Badge>Episode {episode.episode_number}</Badge>
                        </div>
                    </Overlay>
                    {type === "anime" && (
                        <AnimeEpisodeActions episodal_id={episode.id} />
                    )}
                    {type === "tv" && (
                        <EpisodeActions episodal_id={episode.id} />
                    )}
                </AspectRatio>
                <Paper p={8}>
                    <Stack gap={8}>
                        <Title order={4}>{episode.name}</Title>
                        <Group>
                            {episode.air_date && (
                                <Group gap={10}>
                                    <Calendar className="size-4 text-[#828282]" />
                                    <Text size="sm" c="dimmed">
                                        {episode.air_date}
                                    </Text>
                                </Group>
                            )}
                            {episode.runtime && (
                                <Group gap={10}>
                                    <Clock className="size-4 text-[#828282]" />
                                    <Text size="sm" c="dimmed">
                                        {episode.runtime} mins
                                    </Text>
                                </Group>
                            )}
                        </Group>
                        {episode.overview && (
                            <Spoiler
                                maxHeight={30}
                                showLabel="Show more"
                                hideLabel="Hide"
                            >
                                <Text>{episode.overview}</Text>
                            </Spoiler>
                        )}
                    </Stack>
                </Paper>
            </Paper>
        </Grid.Col>
    );
}
