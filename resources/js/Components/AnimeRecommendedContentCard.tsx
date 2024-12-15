import { AnimeRecommendation } from "@/types/anime";
import { Link } from "@inertiajs/react";
import { Badge, Box, Card, Image, Text, Tooltip } from "@mantine/core";

interface AnimeRecommendedContentCardProps {
    content: AnimeRecommendation;
}

function AnimeRecommendedContentCard({
    content,
}: AnimeRecommendedContentCardProps) {
    return (
        <Card
            radius="md"
            w={140}
            withBorder={false}
            style={{ background: "rgba(0, 0, 0, 0)" }}
            shadow="none"
        >
            <Link href={route("anime.show", content.map_id)} prefetch>
                <Card.Section pos="relative">
                    {!!content.vote_average && (
                        <Badge
                            size="lg"
                            radius="md"
                            variant="filled"
                            style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                zIndex: 1,
                            }}
                        >
                            {content.vote_average.toFixed(1)}
                        </Badge>
                    )}
                    <Image
                        src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${content.poster_path}`}
                        radius="md"
                        height={186}
                        fallbackSrc={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="211">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle">${content.collection_name}</text>
        </svg>`)}`}
                        loading="lazy"
                    />
                </Card.Section>
                <Card.Section mt="xs">
                    <Tooltip label={content.collection_name} openDelay={150}>
                        <Box>
                            <Text fw={600} size="sm" lineClamp={2}>
                                {content.collection_name}
                            </Text>
                        </Box>
                    </Tooltip>
                </Card.Section>
            </Link>
        </Card>
    );
}

export default AnimeRecommendedContentCard;
