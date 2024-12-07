import { MovieActions } from "@/Components/MovieActions";
import { MovieBanner } from "@/Components/MovieBanner";
import { MovieCredits } from "@/Components/MovieCredits";
import { MovieDetails } from "@/Components/MovieDetails";
import { MovieSummary } from "@/Components/MovieSummary";
import PosterImage from "@/Components/PosterImage";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import SimilarMovies from "@/Components/SimilarMovies";
import ThemeButton from "@/Components/ThemeButton";
import ContentLayout from "@/Layouts/ContentLayout";
import { MovieProps } from "@/types";
import { Head } from "@inertiajs/react";
import {
    Box,
    Divider,
    Space,
    Spoiler,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

function Movie({ movie }: MovieProps) {
    const { width } = useViewportSize();

    return (
        <>
            <Head title={`${movie.title}`} />
            <ThemeButton />

            <MovieBanner
                title={movie.title}
                backdropPath={movie.backdrop_path}
                logoPath={movie.logo_path}
                genres={movie.genres}
            />

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
                                    {movie.title} ({movie.year})
                                </Title>

                                <Text ta={"center"}>{movie.tagline}</Text>
                                <Divider my={16} />
                                <MovieSummary
                                    voteAverage={movie.vote_average}
                                    releaseDate={movie.release_date}
                                    runtime={movie.runtime}
                                    isoCode={movie.original_language}
                                    right={movie.certification}
                                />
                                <Divider my={16} />
                            </Box>
                            <MovieActions />
                            <Box hiddenFrom="sm">
                                <MovieDetails details={movie.details} />
                                <Divider my={16} />
                                <Stack mt={16}>
                                    <Title order={4}>Overview</Title>
                                    <Spoiler
                                        maxHeight={120}
                                        showLabel="Show more"
                                        hideLabel="Hide"
                                    >
                                        <Text>
                                            {movie.overview ??
                                                "No overview available"}
                                        </Text>
                                    </Spoiler>
                                </Stack>
                                <Divider my={16} />
                                <MovieCredits
                                    cast={movie.credits.cast}
                                    crew={movie.credits.crew}
                                    containerWidth={width * 0.95}
                                    slideSize="20%"
                                />
                                <Divider my={16} />
                                <SimilarMovies
                                    similarMovies={movie.similar}
                                    containerWidth={width * 0.95}
                                />
                            </Box>
                        </Stack>
                    }
                    right={
                        <Box visibleFrom="sm">
                            <Stack gap={8}>
                                <Title order={2}>
                                    {movie.title} ({movie.year})
                                </Title>
                                <Text>{movie.tagline}</Text>
                                <Divider my={8} />
                                <MovieSummary
                                    voteAverage={movie.vote_average}
                                    releaseDate={movie.release_date}
                                    runtime={movie.runtime}
                                    isoCode={movie.original_language}
                                    right={movie.certification}
                                />
                                <Divider my={8} />
                            </Stack>
                            <MovieDetails details={movie.details} />
                            <Divider my={16} />
                            <Stack mt={16}>
                                <Title order={4}>Overview</Title>
                                <Spoiler
                                    maxHeight={120}
                                    showLabel="Show more"
                                    hideLabel="Hide"
                                >
                                    <Text>
                                        {movie.overview ??
                                            "No overview available"}
                                    </Text>
                                </Spoiler>
                            </Stack>
                            <Divider my={16} />
                            <MovieCredits
                                cast={movie.credits.cast}
                                crew={movie.credits.crew}
                                containerWidth={width * 0.67}
                            />
                            <Divider my={16} />
                            <SimilarMovies
                                similarMovies={movie.similar}
                                containerWidth={width * 0.67}
                            />
                        </Box>
                    }
                />
            </ResponsiveContainer>

            <pre>{JSON.stringify(movie, null, 2)}</pre>
        </>
    );
}

export default Movie;
