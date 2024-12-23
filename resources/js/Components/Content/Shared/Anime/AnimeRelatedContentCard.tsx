import { RelatedAnime, SimilarAnime } from "@/types/animeseason";
import { Link } from "@inertiajs/react";
import { Badge, Box, Card, Image, Stack, Text, Tooltip } from "@mantine/core";

interface AnimeRelatedContentCardProps {
    content: RelatedAnime | SimilarAnime;
    type: "related" | "similar";
}

export default function AnimeRelatedContentCard({
    content,
    type,
}: AnimeRelatedContentCardProps) {
    return (
        <Card
            radius="md"
            w={140}
            withBorder={false}
            style={{ background: "rgba(0, 0, 0, 0)" }}
            shadow="none"
        >
            <Link
                href={route("anime.season.show", {
                    id: content.map_id,
                    seasonId:
                        type === "related"
                            ? (content as RelatedAnime).related_anime_id
                            : (content as SimilarAnime).similar_anime_id,
                })}
                prefetch
                className="no-underline"
            >
                <Card.Section pos="relative">
                    {type === "related" && (
                        <Badge
                            size="sm"
                            radius="md"
                            variant="gradient"
                            gradient={{ from: "orange", to: "red", deg: 90 }}
                            className="absolute top-2 right-2 z-1"
                        >
                            {(content as RelatedAnime).relation_type}
                        </Badge>
                    )}
                    <Image
                        src={`https://anidb.net/images/main/${content.picture}`}
                        radius="md"
                        height={186}
                        w={124}
                        mih={124}
                        h={186}
                        fallbackSrc={`data:image/svg+xml,${encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="211">
                                <rect width="100%" height="100%" fill="#f0f0f0"/>
                                <text x="50%" y="50%" text-anchor="middle">${content.name}</text>
                            </svg>`
                        )}`}
                        loading="lazy"
                        alt=""
                    />
                </Card.Section>
                <Card.Section mt="xs">
                    <Tooltip label={content.name} openDelay={150}>
                        <Box>
                            <Text fw={600} size="sm" lineClamp={2}>
                                {content.name}
                            </Text>
                        </Box>
                    </Tooltip>
                </Card.Section>
            </Link>
        </Card>
    );
}
