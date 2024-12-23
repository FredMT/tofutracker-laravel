import { Badge, Box, Card, Image, Text, Tooltip } from "@mantine/core";
import { Link, usePage } from "@inertiajs/react";
import { PageProps, Similar } from "@/types";

interface SimilarContentCardProps {
    content: Similar;
}

function SimilarContentCard({ content }: SimilarContentCardProps) {
    const { type } = usePage<PageProps>().props;

    return (
        <Card
            radius="md"
            w={140}
            withBorder={false}
            style={{ background: "rgba(0, 0, 0, 0)" }}
            shadow="none"
        >
            <Link href={route(`${type}.show`, content.id)} prefetch>
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
            <text x="50%" y="50%" text-anchor="middle">${content.title}</text>
        </svg>`)}`}
                        loading="lazy"
                    />
                </Card.Section>
                <Card.Section mt="xs">
                    <Tooltip
                        label={`${content.title} (${new Date(
                            content.release_date
                        ).getFullYear()})`}
                        openDelay={150}
                    >
                        <Box>
                            <Text fw={600} size="sm" lineClamp={2}>
                                {content.title}
                            </Text>
                            <Text fw={600} size="sm" mt={6} c="dimmed">
                                {new Date(content.release_date).getFullYear()}
                            </Text>
                        </Box>
                    </Tooltip>
                </Card.Section>
            </Link>
        </Card>
    );
}

export default SimilarContentCard;
