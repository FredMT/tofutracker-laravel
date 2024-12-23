import { MediaItem } from "@/types/search";
import { Link } from "@inertiajs/react";
import {
    Badge,
    Card,
    Group,
    Image,
    Text,
    Box,
    Spoiler,
    Title,
    AspectRatio,
    Tooltip,
} from "@mantine/core";

interface SearchResultProps {
    item: MediaItem;
    type: "movies" | "tv" | "anime";
    variant: "list" | "card";
}

export default function SearchResult({
    item,
    type,
    variant,
}: SearchResultProps) {
    const getLink = () => {
        if (type === "anime" && item.map_id) {
            return `/anime/${item.map_id}`;
        }
        return `/${type === "movies" ? "movie" : type}/${item.id}`;
    };

    if (variant === "card") {
        return (
            <Card
                p={0}
                className="group relative"
                component={Link}
                href={getLink()}
                prefetch
                bg="transparent"
                withBorder={false}
            >
                <Image
                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                    alt={item.title}
                    height={200}
                    h={250}
                    w={200}
                    className="aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
                    fallbackSrc={`https://placehold.co/300x450?text=${item.title}`}
                    radius="md"
                    fit="fill"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <Title
                        className="absolute bottom-2 left-2"
                        c="white"
                        size="lg"
                        fw={500}
                        fz="sm"
                        lineClamp={3}
                    >
                        {item.title} ({item.year})
                    </Title>
                </div>
            </Card>
        );
    }

    return (
        <Card shadow="sm" radius="md" padding={0} bg="transparent">
            <Group wrap="nowrap" gap={0} align="flex-start">
                <Card.Section>
                    <Link href={getLink()} prefetch>
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            height={150}
                            h={150}
                            w={100}
                            alt={item.title}
                            fallbackSrc={`https://placehold.co/133x200?text=${item.title}`}
                        />
                    </Link>
                </Card.Section>

                <Box p="md" style={{ flex: 1 }}>
                    <Group
                        justify="space-between"
                        mb={4}
                        preventGrowOverflow
                        grow
                    >
                        <Link href={getLink()} prefetch>
                            <Tooltip label={`${item.title} (${item.year})`}>
                                <Text fw={500} size="lg" lineClamp={3}>
                                    {item.title} ({item.year})
                                </Text>
                            </Tooltip>
                        </Link>
                        {item.vote_average > 0 && (
                            <Badge size="lg" variant="filled" maw={60}>
                                {item.vote_average.toFixed(1)}
                            </Badge>
                        )}
                    </Group>

                    <Group gap={6} mb={8}>
                        {item.genres.map((genre) => (
                            <Badge key={genre.id} size="sm" variant="outline">
                                {genre.name}
                            </Badge>
                        ))}
                    </Group>

                    <Spoiler
                        maxHeight={62}
                        showLabel="Show more"
                        hideLabel="Show less"
                    >
                        <Text size="sm" c="dimmed">
                            {item.overview}
                        </Text>
                    </Spoiler>
                </Box>
            </Group>
        </Card>
    );
}
