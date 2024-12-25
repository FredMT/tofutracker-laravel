import MovieCard from "@/Components/Shared/MovieCard";
import { useFilterStore } from "@/stores/filterStore";
import { PageProps } from "@/types/userMovies";
import { router, usePage } from "@inertiajs/react";
import { Flex, Group, Pagination, Text } from "@mantine/core";

export function UserMovieSection() {
    const filterStore = useFilterStore();

    const { movies, userData } = usePage<PageProps>().props;
    const hasFilters = useFilterStore((state) =>
        Boolean(
            state.status ||
                state.title ||
                state.fromDate ||
                state.toDate ||
                state.genres.length > 0
        )
    );

    const handlePageChange = (page: number) => {
        const currentFilters: Record<string, any> = {};

        if (filterStore.status) currentFilters.status = filterStore.status;
        if (filterStore.title) currentFilters.title = filterStore.title;
        if (filterStore.fromDate)
            currentFilters.from_date = filterStore.fromDate.toISOString();
        if (filterStore.toDate)
            currentFilters.to_date = filterStore.toDate.toISOString();
        if (filterStore.genres.length > 0)
            currentFilters.genres = filterStore.genres.join(",");

        router.get(
            `/user/${userData.username}/movies`,
            {
                page,
                ...currentFilters,
            },
            {
                preserveState: true,
            }
        );
    };

    return (
        <>
            <Flex gap={6} wrap="wrap" justify="flex-start">
                {movies.data.map((movie) => (
                    <MovieCard
                        key={movie.id}
                        id={movie.id}
                        title={movie.title}
                        time={movie.added_at}
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        rating={movie.rating}
                        watch_status={movie.watch_status}
                    />
                ))}
            </Flex>
            <Group justify="space-between" align="center" w="100%">
                <Text size="sm" c="dimmed">
                    {hasFilters ? "Filtered results: " : ""}
                    Showing {movies.from}-{movies.to} of {movies.total} results
                </Text>
                {movies.data.length > 23 && (
                    <Pagination
                        value={movies.current_page}
                        onChange={handlePageChange}
                        total={movies.last_page}
                        withEdges
                        siblings={2}
                    />
                )}
            </Group>
        </>
    );
}

export default UserMovieSection;
