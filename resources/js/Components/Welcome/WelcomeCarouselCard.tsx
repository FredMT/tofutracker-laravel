import { Card, Group, Image, Stack, Text, Title } from "@mantine/core";
import { Star } from "lucide-react";
import classes from "./WelcomeCarouselSlide.module.css";
import { Link } from "@inertiajs/react";

interface WelcomeCarouselCardProps {
    id: number;
    title: string;
    posterPath: string;
    type: string;
    vote_average: number;
}
function getContentType(type: string) {
    switch (type) {
        case "movie":
            return "Movie";
        case "tv":
            return "TV Show";
        case "anime":
            return "Anime";
        default:
            return "Unknown";
    }
}

function WelcomeCarouselCard({
    id,
    title,
    posterPath,
    type,
    vote_average,
}: WelcomeCarouselCardProps) {
    return (
        <Card
            w={200}
            maw={200}
            p={0}
            bg="transparent"
            withBorder={false}
            component={Link}
            prefetch
            href={`/${type}/${id}`}
            shadow="none"
        >
            <Card.Section className={classes.cardWrapper}>
                <Image
                    src={`https://image.tmdb.org/t/p/original${posterPath}`}
                    alt={title}
                    height={350}
                    mih={300}
                    maw={200}
                    radius="md"
                    loading="lazy"
                />
                <div className={classes.cardOverlay}>
                    <Stack gap="xs" className={classes.overlayText}>
                        <Title order={4} fw={600}>
                            {title}
                        </Title>
                        <Group justify="space-between">
                            <Text size="sm">{getContentType(type)}</Text>
                            <Group gap={4}>
                                <Star size={16} />
                                <Text>{vote_average.toFixed(1)}</Text>
                            </Group>
                        </Group>
                    </Stack>
                </div>
            </Card.Section>
        </Card>
    );
}

export default WelcomeCarouselCard;