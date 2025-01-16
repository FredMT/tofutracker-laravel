import {AnimeCollection} from "@/types/userAnime";
import {Link} from "@inertiajs/react";
import {Badge, Button, Card, Group, Image, Modal, Space, Stack, Text, Tooltip,} from "@mantine/core";
import {ExternalLink} from "lucide-react";
import {useState} from "react";
import classes from "./AnimeCard.module.css";
import AnimeSeasonModal from "@/Components/Shared/UserAnime/AnimeSeasonModal";

interface AnimeCardProps {
    collection: AnimeCollection;
}

export default function AnimeCard({ collection }: AnimeCardProps) {
    const [showSeasons, setShowSeasons] = useState(false);
    const hasUnwatchedSeasons =
        collection.total_seasons > 0 && collection.user_total_seasons === 0;

    return (
        <>
            <Card maw={180} bg="transparent" bd={0} shadow="none">
                <Card.Section pos="relative">
                    <Link
                        href={route("anime.show", {
                            id: collection.id,
                        })}
                        prefetch
                    >
                        <Tooltip label={collection.title} openDelay={150}>
                            <Image
                                src={
                                    collection.poster_path
                                        ? `https://image.tmdb.org/t/p/w185${collection.poster_path}`
                                        : undefined
                                }
                                alt={`${collection.title} Poster`}
                                height={210}
                                loading="lazy"
                                className={classes.posterImage}
                                radius="md"
                                fallbackSrc={`https://placehold.co/172x260?text=${
                                    collection.title ?? ""
                                }`}
                            />
                        </Tooltip>
                    </Link>
                    {collection.rating && (
                        <Badge
                            bg="violet.8"
                            size="xs"
                            className={classes.ratingBadge}
                        >
                            {collection.rating}
                        </Badge>
                    )}
                </Card.Section>
                <Card.Section
                    component={Link}
                    href={route("anime.show", {
                        id: collection.id,
                    })}
                    prefetch
                >
                    <Tooltip label={collection.title} openDelay={150}>
                        <Text lineClamp={1} fw={500}>
                            {collection.title}
                        </Text>
                    </Tooltip>
                </Card.Section>
                <Card.Section>
                    <Badge
                        bg="violet.9"
                        py={12}
                        radius="sm"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowSeasons(true)}
                    >
                        <Group justify="space-between" w="100%" wrap="nowrap">
                            <Space w={0} />
                            <Text size="xs">
                                {collection.movies?.length ? (
                                    "Movie"
                                ) : (
                                    <>
                                        {collection.user_total_seasons}/
                                        {collection.total_seasons} Seasons
                                    </>
                                )}
                            </Text>
                            <ExternalLink size={14} />
                        </Group>
                    </Badge>
                </Card.Section>
            </Card>

            {hasUnwatchedSeasons ? (
                <Modal
                    opened={showSeasons}
                    onClose={() => setShowSeasons(false)}
                    title={collection.title}
                    size="sm"
                    centered
                >
                    <Stack>
                        <Text>
                            You've added this anime to your collection but
                            haven't watched any seasons yet.
                        </Text>
                        <Button
                            component={Link}
                            href={route("anime.show", { id: collection.id })}
                            variant="filled"
                            color="violet"
                            rightSection={<ExternalLink size={16} />}
                        >
                            Go to Collection Page
                        </Button>
                    </Stack>
                </Modal>
            ) : (
                <AnimeSeasonModal
                    collection={collection}
                    opened={showSeasons}
                    onClose={() => setShowSeasons(false)}
                />
            )}
        </>
    );
}
