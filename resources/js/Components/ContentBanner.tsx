import { Badge, Flex, Group, Image, Paper } from "@mantine/core";
import classes from "./ContentBanner.module.css";
import { usePage } from "@inertiajs/react";
import { Genre, PageProps } from "@/types";

export function ContentBanner() {
    const { type, movie, tv, anime } = usePage<PageProps>().props;
    const content = type === "movie" ? movie : type === "tv" ? tv : anime;
    if (!content) return null;

    return (
        <Flex direction="column" pos="relative">
            <Image
                src={
                    content.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
                        : undefined
                }
                alt={content.title}
                fit="cover"
                mah={540}
                mih={540}
                height={540}
                fallbackSrc={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='540' viewBox='0 0 1920 540'><rect width='1920' height='540' fill='%23cccccc'/><text x='50%25' y='50%25' font-size='48' font-family='Arial,sans-serif' fill='%23000000' text-anchor='middle' alignment-baseline='central'>${content.title}</text></svg>`}
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
                    {content.logo_path && (
                        <Image
                            src={`https://image.tmdb.org/t/p/original${content.logo_path}`}
                            alt={content.title}
                            fit="contain"
                            className={classes.logo}
                        />
                    )}
                </Paper>
                <Group gap={2} justify="center">
                    {content.genres.map((genre: Genre) => (
                        <Badge key={genre.id} variant="outline">
                            {genre.name}
                        </Badge>
                    ))}
                </Group>
            </Flex>
        </Flex>
    );
}
