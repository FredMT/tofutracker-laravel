import { useContent } from "@/hooks/useContent";
import { Genre, PageProps } from "@/types";
import { Badge, Flex, Group, Image, Paper } from "@mantine/core";
import classes from "./ContentBanner.module.css";
import { usePage } from "@inertiajs/react";
import { useAnimeContent } from "@/hooks/useAnimeContent";

export function ContentBanner() {
    const { content: regularContent, type } = useContent();
    const animeContent = useAnimeContent();

    // Handle anime content
    if (type === "animetv" || type === "animemovie") {
        if (!animeContent) return null;
        const { tmdbData } = animeContent;

        return (
            <Flex direction="column" pos="relative">
                <Image
                    src={
                        tmdbData.backdrop_path
                            ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`
                            : undefined
                    }
                    alt={tmdbData.title}
                    fit="cover"
                    mah={540}
                    mih={540}
                    height={540}
                    fallbackSrc={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='540' viewBox='0 0 1920 540'><rect width='1920' height='540' fill='%23cccccc'/><text x='50%25' y='50%25' font-size='48' font-family='Arial,sans-serif' fill='%23000000' text-anchor='middle' alignment-baseline='central'>${tmdbData.title}</text></svg>`}
                />
                <BannerContent
                    logo_path={tmdbData.logo_path}
                    title={tmdbData.title}
                    genres={tmdbData.genres}
                />
            </Flex>
        );
    }

    // Handle regular content
    if (!regularContent) return null;

    return (
        <Flex direction="column" pos="relative">
            <Image
                src={
                    regularContent.backdrop_path
                        ? `https://image.tmdb.org/t/p/original${regularContent.backdrop_path}`
                        : undefined
                }
                alt={regularContent.title}
                fit="cover"
                mah={540}
                mih={540}
                height={540}
                fallbackSrc={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='540' viewBox='0 0 1920 540'><rect width='1920' height='540' fill='%23cccccc'/><text x='50%25' y='50%25' font-size='48' font-family='Arial,sans-serif' fill='%23000000' text-anchor='middle' alignment-baseline='central'>${regularContent.title}</text></svg>`}
            />
            <BannerContent
                logo_path={regularContent.logo_path}
                title={regularContent.title}
                genres={regularContent.genres}
            />
        </Flex>
    );
}

function BannerContent({
    logo_path,
    title,
    genres,
}: {
    logo_path: string;
    title: string;
    genres: Genre[];
}) {
    return (
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
                {logo_path && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${logo_path}`}
                        alt={title}
                        fit="contain"
                        className={classes.logo}
                    />
                )}
            </Paper>
            <Group gap={2} justify="center">
                {genres.map((genre: Genre) => (
                    <Badge key={genre.id} variant="filled" color="black">
                        {genre.name}
                    </Badge>
                ))}
            </Group>
        </Flex>
    );
}
