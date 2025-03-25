import { Episode } from "@/types";
import { Flex, Group, Image, Spoiler, Stack, Text, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import styles from "./ContentEpisodeCard.module.css";
import AnimeEpisodeActions from "@/Components/Content/Episodes/AnimeEpisodeActions";
import EpisodeActions from "@/Components/Content/Episodes/EpisodeActions";

export default function ContentEpisodeCard({
    episode,
    imageSource,
    type,
}: {
    episode: Episode;
    imageSource: string;
    type: "anime" | "tv";
}) {
    const isDesktop = useMediaQuery("(min-width: 900px)");
    const imageBaseUrl =
        imageSource === "tmdb"
            ? "https://image.tmdb.org/t/p/original"
            : "https://artworks.thetvdb.com";
    if (isDesktop) {
        return (
            <Flex>
                <Stack gap={0}>
                    <Image
                        alt={`Episode ${episode.episode_number}: ${episode.name}`}
                        src={
                            episode.still_path
                                ? `${imageBaseUrl}${episode.still_path}`
                                : undefined
                        }
                        height={220}
                        h={220}
                        miw={380}
                        fit="cover"
                        mah={220}
                        loading="lazy"
                        fallbackSrc={`data:image/svg+xml,${encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="220">
                                <rect width="100%" height="100%" fill="#f0f0f0"/>
                                <text x="50%" y="50%" text-anchor="middle">${`Episode ${episode.episode_number}: ${episode.name}`}</text>
                            </svg>`
                        )}`}
                    />
                    {type === "anime" && (
                        <AnimeEpisodeActions episodal_id={episode.id} />
                    )}
                    {type === "tv" && (
                        <EpisodeActions episodal_id={episode.id} />
                    )}
                </Stack>

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
        <>
            <Stack gap={0}>
                <div className={styles.imageWrapper}>
                    <Image
                        alt={episode.name}
                        src={
                            episode.still_path
                                ? `${imageBaseUrl}${episode.still_path}`
                                : undefined
                        }
                        loading="lazy"
                        height={220}
                        fit="cover"
                        h={220}
                        fallbackSrc={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='140' height='211'>
                    <rect width='100%' height='100%' fill='#f0f0f0'/>
                    <text x='50%' y='50%' text-anchor='middle'>${episode.name}</text>
                </svg>`)}`}
                    />

                    <div className={styles.imageOverlay}>
                        <Stack className={styles.overlayContent} gap={4}>
                            <Text
                                size="sm"
                                c="white"
                                className={styles.airDate}
                            >
                                {episode.air_date}
                            </Text>
                            <Title order={5} c="white">
                                {`Episode ${episode.episode_number}: ${episode.name}`}
                            </Title>
                        </Stack>
                    </div>
                </div>
                {type === "anime" && (
                    <AnimeEpisodeActions episodal_id={episode.id} />
                )}
                {type === "tv" && <EpisodeActions episodal_id={episode.id} />}
            </Stack>
        </>
    );
}
