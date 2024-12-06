import PosterImage from "@/Components/PosterImage";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import ThemeButton from "@/Components/ThemeButton";
import ContentLayout from "@/Layouts/ContentLayout";
import { MovieProps } from "@/types";
import {
    formatReleaseDate,
    formatRuntime,
    getLanguageName,
} from "@/utils/formatter";
import { Head } from "@inertiajs/react";
import {
    Badge,
    Box,
    Button,
    Divider,
    Flex,
    Grid,
    Group,
    Image,
    Paper,
    Space,
    Spoiler,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

function getUSCertification(releaseDates: any) {
    if (!releaseDates || !Array.isArray(releaseDates.results)) {
        return null; // Handle edge case where releaseDates or results is invalid
    }

    // Find the US entry in the results array
    const usEntry = releaseDates.results.find(
        (entry: any) => entry.iso_3166_1 === "US"
    );
    if (!usEntry || !Array.isArray(usEntry.release_dates)) {
        return null; // Handle edge case where no US entry or release_dates array exists
    }

    // Find the first release date with a valid certification
    const validCertification = usEntry.release_dates.find((date: any) =>
        date.certification?.trim()
    );
    return validCertification ? validCertification.certification : null;
}

function Movie({ movie }: MovieProps) {
    const { width } = useViewportSize();
    console.log(`https://image.tmdb.org/t/p/original${movie.poster_path}`);
    return (
        <>
            <Head title={`${movie.title}`} />
            <ThemeButton />

            <Flex direction="column" pos="relative">
                <Image
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    fit="cover"
                    mah={540}
                    h={540}
                    fallbackSrc="https://placehold.co/600x400?text=Placeholder"
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
                        p="xs"
                        bg="rgba(0, 0, 0, 0)"
                        withBorder={false}
                        shadow="none"
                    >
                        {width > 450 && (
                            <Image
                                src={`https://image.tmdb.org/t/p/original${
                                    movie.images.logos.sort(
                                        (a, b) =>
                                            b.vote_average - a.vote_average
                                    )[0]?.file_path
                                }`}
                                alt={movie.title}
                                fit="contain"
                                h={width > 600 ? 200 : 100}
                                fallbackSrc={
                                    width > 600
                                        ? "https://placehold.co/600x200?text=No+Logo"
                                        : "https://placehold.co/600x50?text=No+Logo"
                                }
                            />
                        )}
                    </Paper>
                    <Group gap={2} justify="center">
                        {movie.genres.map((genre) => (
                            <Badge key={genre.id} variant="outline">
                                {genre.name}
                            </Badge>
                        ))}
                    </Group>
                </Flex>
            </Flex>
            <ResponsiveContainer>
                <Space h={24} />
                <ContentLayout
                    left={
                        <Stack gap={24} align="center">
                            <PosterImage
                                src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                                alt={movie.title}
                                fallbackSrc="https://placehold.co/600x900?text=No+Poster"
                            />
                            <Box hiddenFrom="sm">
                                <Title order={2} ta="center">
                                    {movie.title} (
                                    {movie.release_date.split("-")[0]})
                                </Title>

                                <Text ta={"center"}>{movie.tagline}</Text>
                                <Divider my={16} />
                                <Group
                                    wrap="wrap"
                                    gap={36}
                                    preventGrowOverflow
                                    justify="center"
                                >
                                    <Badge variant="outline">
                                        {movie.vote_average.toFixed(2)}
                                    </Badge>
                                    <Text>
                                        {formatReleaseDate(movie.release_date)}
                                    </Text>
                                    <Text>{formatRuntime(movie.runtime)}</Text>
                                    <Text>
                                        {getLanguageName(
                                            movie.original_language
                                        )}
                                    </Text>
                                    <Text>
                                        {getUSCertification(
                                            movie.release_dates
                                        )}
                                    </Text>
                                </Group>
                                <Divider my={16} />
                            </Box>
                            <Button fullWidth>Add to Library</Button>
                            <Button fullWidth variant="primary">
                                Rate
                            </Button>
                            <Button fullWidth>Choose Status</Button>
                        </Stack>
                    }
                    right={
                        <Box visibleFrom="sm">
                            <Stack gap={8}>
                                <Title order={2}>
                                    {movie.title} (
                                    {movie.release_date.split("-")[0]})
                                </Title>
                                <Text>{movie.tagline}</Text>
                                <Divider my={8} />
                                <Group
                                    wrap="wrap"
                                    gap={36}
                                    preventGrowOverflow
                                    justify="center"
                                >
                                    <Badge variant="outline">
                                        {movie.vote_average.toFixed(2)}
                                    </Badge>
                                    <Text>
                                        {formatReleaseDate(movie.release_date)}
                                    </Text>
                                    <Text>{formatRuntime(movie.runtime)}</Text>
                                    <Text>
                                        {getLanguageName(
                                            movie.original_language
                                        )}
                                    </Text>
                                    <Text>
                                        {getUSCertification(
                                            movie.release_dates
                                        )}
                                    </Text>
                                </Group>
                                <Divider my={8} />
                                <Spoiler
                                    maxHeight={120}
                                    showLabel="Show more"
                                    hideLabel="Hide"
                                >
                                    <Text>{movie.overview}</Text>
                                </Spoiler>
                            </Stack>
                        </Box>
                    }
                ></ContentLayout>
                <Stack mt={200}>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(movie, null, 2)}
                    </pre>
                </Stack>
            </ResponsiveContainer>
        </>
    );
}

export default Movie;
