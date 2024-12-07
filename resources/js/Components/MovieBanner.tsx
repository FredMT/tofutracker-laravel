import { Badge, Flex, Group, Image, Paper } from "@mantine/core";
import classes from "./MovieBanner.module.css";

interface MovieBannerProps {
    title: string;
    backdropPath: string | null;
    logoPath: string | null;
    genres: Array<{ id: number; name: string }>;
}

export function MovieBanner({
    title,
    backdropPath,
    logoPath,
    genres,
}: MovieBannerProps) {
    return (
        <Flex direction="column" pos="relative">
            <Image
                src={
                    backdropPath
                        ? `https://image.tmdb.org/t/p/original${backdropPath}`
                        : undefined
                }
                alt={title}
                fit="cover"
                mah={540}
                mih={540}
                height={540}
                fetchPriority="high"
                fallbackSrc={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='540' viewBox='0 0 1920 540'><rect width='1920' height='540' fill='%23cccccc'/><text x='50%25' y='50%25' font-size='48' font-family='Arial,sans-serif' fill='%23000000' text-anchor='middle' alignment-baseline='central'>${title}</text></svg>`}
            />

            <Flex
                pos="absolute"
                bottom={0}
                w="100%"
                justify="center"
                align="center"
                pb="xl"
                direction={{ base: "column" }}
            >
                <Paper
                    className={classes.logoWrapper}
                    withBorder={false}
                    shadow="none"
                >
                    {logoPath && (
                        <Image
                            src={`https://image.tmdb.org/t/p/original${logoPath}`}
                            alt={title}
                            fit="contain"
                            className={classes.logo}
                        />
                    )}
                </Paper>
                <Group gap={2} justify="center">
                    {genres.map((genre) => (
                        <Badge key={genre.id} variant="outline">
                            {genre.name}
                        </Badge>
                    ))}
                </Group>
            </Flex>
        </Flex>
    );
}
