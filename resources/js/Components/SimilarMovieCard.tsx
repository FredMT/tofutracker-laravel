import { Badge, Box, Card, Image, Text, Tooltip } from "@mantine/core";
import { Link } from "@inertiajs/react";
import { SimilarMovie } from "@/types";

function SimilarMovieCard({ movie }: { movie: SimilarMovie }) {
    return (
        <Card
            radius="md"
            w={140}
            withBorder={false}
            style={{ background: "rgba(0, 0, 0, 0)" }}
            shadow="none"
        >
            <Link href={`/movie/${movie.id}`} prefetch>
                <Card.Section pos="relative">
                    {!!movie.vote_average && (
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
                            {movie.vote_average.toFixed(1)}
                        </Badge>
                    )}
                    <Image
                        src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`}
                        radius="md"
                        height={186}
                        fallbackSrc={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="211">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle">${movie.title}</text>
        </svg>`)}`}
                        loading="lazy"
                    />
                </Card.Section>
                <Card.Section mt="xs">
                    <Tooltip
                        label={`${movie.title} (${
                            movie.release_date.split("-")[0]
                        })`}
                        openDelay={150}
                    >
                        <Box>
                            <Text fw={600} size="sm" lineClamp={2}>
                                {movie.title}
                            </Text>
                            <Text fw={600} size="sm" mt={6} c="dimmed">
                                {movie.release_date.split("-")[0]}
                            </Text>
                        </Box>
                    </Tooltip>
                </Card.Section>
            </Link>
        </Card>
    );
}

export default SimilarMovieCard;
