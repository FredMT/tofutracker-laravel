import { Badge, Box, Card, Image, Stack, Text, Tooltip } from "@mantine/core";
import { Season } from "@/types";
import { Link } from "@inertiajs/react";

interface SeasonCardProps {
    season: Season;
}

function SeasonCard({ season }: SeasonCardProps) {
    return (
        <Link href={`${season.show_id}/season/${season.id}`}>
            <Card
                radius="md"
                w={140}
                withBorder={false}
                style={{ background: "rgba(0, 0, 0, 0)" }}
                shadow="none"
            >
                <Card.Section pos="relative">
                    {!!season.vote_average && (
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
                            {season.vote_average}
                        </Badge>
                    )}
                    <Image
                        src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${season.poster_path}`}
                        radius="md"
                        height={186}
                        fallbackSrc={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="211">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle">${season.name}</text>
        </svg>`)}`}
                        loading="lazy"
                    />
                </Card.Section>
                <Card.Section mt="xs">
                    <Tooltip
                        label={`${season.name} (${new Date(
                            season.air_date
                        ).getFullYear()})`}
                        openDelay={150}
                    >
                        <Stack gap={2}>
                            <Text fw={600} size="sm" lineClamp={2}>
                                {season.name}
                                <Text component="span">
                                    {` (${new Date(
                                        season.air_date
                                    ).getFullYear()})`}
                                </Text>
                            </Text>
                            <Text size="sm" c="dimmed">
                                {season.episode_count} eps
                            </Text>
                        </Stack>
                    </Tooltip>
                </Card.Section>
            </Card>
        </Link>
    );
}

export default SeasonCard;
