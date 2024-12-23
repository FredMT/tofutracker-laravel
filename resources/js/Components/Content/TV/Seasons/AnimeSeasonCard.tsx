import { RelatedAnimeData } from "@/types/anime";
import { Badge, Card, Image, Stack, Text, Tooltip } from "@mantine/core";

interface AnimeSeasonCardProps {
    season: RelatedAnimeData;
}

export default function AnimeSeasonCard({ season }: AnimeSeasonCardProps) {
    return (
        <Card
            radius="md"
            withBorder={false}
            w={140}
            style={{ background: "rgba(0, 0, 0, 0)" }}
            shadow="none"
        >
            <Card.Section pos="relative">
                {season.rating && (
                    <Badge
                        size="lg"
                        radius="md"
                        variant="gradient"
                        gradient={{ from: "gray", to: "orange", deg: 90 }}
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                        }}
                    >
                        {Number(season.rating).toFixed(1)}
                    </Badge>
                )}
                <Image
                    src={`https://anidb.net/images/main/${season.picture}`}
                    radius="md"
                    height={186}
                    w={124}
                    h={186}
                    fallbackSrc={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="211">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle">${season.title}</text>
        </svg>`)}`}
                    loading="lazy"
                    alt=""
                />
            </Card.Section>
            <Card.Section mt="xs">
                <Tooltip
                    label={`${season.title} (${season.episode_count} episodes)`}
                    openDelay={150}
                >
                    <Stack gap={2}>
                        <Text fw={600} size="sm" lineClamp={2}>
                            {season.title}
                        </Text>
                        <Text size="sm" c="dimmed">
                            {season.type} • {season.episode_count} eps
                        </Text>
                    </Stack>
                </Tooltip>
            </Card.Section>
        </Card>
    );
}
