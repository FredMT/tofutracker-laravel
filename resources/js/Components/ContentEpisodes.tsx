import { Episode, PageProps, TvSeason } from "@/types";
import { usePage } from "@inertiajs/react";
import {
    Divider,
    Flex,
    Group,
    Image,
    Paper,
    Spoiler,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import styles from "./ContentEpisodes.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { BookmarkPlus, Heart } from "lucide-react";

function ContentEpisodes() {
    const { type, tvseason } = usePage<PageProps>().props;
    if (type !== "tvseason" || !tvseason) return null;
    const season = tvseason as TvSeason;
    return (
        <Stack mb={24}>
            <Divider my={16} />
            <Title order={3}>Episodes</Title>
            {season.episodes.map((episode) => (
                <EpisodeCard episode={episode} key={episode.id} />
            ))}
        </Stack>
    );
}

export default ContentEpisodes;

function EpisodeCard({ episode }: { episode: Episode }) {
    const isDesktop = useMediaQuery("(min-width: 900px)");
    if (isDesktop) {
        return (
            <Flex>
                <Image
                    alt={`Episode ${episode.episode_number}: ${episode.name}`}
                    src={`https://image.tmdb.org/t/p/original${episode.still_path}`}
                    height={220}
                    w={380}
                    h={220}
                />
                <Paper
                    shadow="xl"
                    className={styles.actionsPaper}
                    radius={0}
                    w={34}
                    h={220}
                    miw={34}
                    mih={220}
                    maw={34}
                    mah={220}
                >
                    <Group justify="center" py={12} px={3}>
                        <Heart />
                        <BookmarkPlus />
                    </Group>
                </Paper>
                <Stack ml={16} py={4}>
                    <Stack gap={0}>
                        <Title
                            order={4}
                        >{`Episode ${episode.episode_number}: ${episode.name}`}</Title>
                    </Stack>
                    <Group align="center" gap={6}>
                        <Text size="sm" c="white" className={styles.airDate}>
                            {episode.air_date}
                        </Text>
                        {episode.runtime && (
                            <Text c={"dimmed"} size="sm">
                                — {episode.runtime}m
                            </Text>
                        )}
                    </Group>
                    <Spoiler
                        maxHeight={100}
                        showLabel="Show more"
                        hideLabel="Hide"
                    >
                        <Text>{episode.overview}</Text>
                    </Spoiler>
                </Stack>
            </Flex>
        );
    }

    return (
        <Stack gap={0}>
            <div className={styles.imageWrapper}>
                <Image
                    alt={episode.name}
                    src={`https://image.tmdb.org/t/p/original${episode.still_path}`}
                    height={186}
                    fallbackSrc={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='140' height='211'>
                    <rect width='100%' height='100%' fill='#f0f0f0'/>
                    <text x='50%' y='50%' text-anchor='middle'>${episode.name}</text>
                </svg>`)}`}
                />
                <div className={styles.imageOverlay}>
                    <Stack className={styles.overlayContent} gap={4}>
                        <Text size="sm" c="white" className={styles.airDate}>
                            {episode.air_date}
                        </Text>
                        <Title order={5} c="white">
                            {`Episode ${episode.episode_number}: ${episode.name}`}
                        </Title>
                    </Stack>
                </div>
            </div>
            <Paper
                shadow="xl"
                p="sm"
                className={styles.actionsPaper}
                radius={0}
            >
                <Group align="center">
                    <Heart />
                    <BookmarkPlus />
                </Group>
            </Paper>
        </Stack>
    );
}
