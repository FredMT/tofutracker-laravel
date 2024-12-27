import FilterDesktop from "@/Components/UserProfile/Filter/FilterDesktop";
import FilterMobile from "@/Components/UserProfile/Filter/FilterMobile";
import FilterSearchInput from "@/Components/UserProfile/Filter/FilterSearchInput";
import UserMovieLayout from "@/Components/UserProfile/UserMovieLayout";
import UserMovieSection from "@/Components/UserProfile/UserMovieSection";
import { useFilterStore } from "@/hooks/useFilterStore";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { PageProps } from "@/types/userMovies";
import { Head } from "@inertiajs/react";
import { Box, Space, Stack, Text, Title } from "@mantine/core";
import { useEffect } from "react";

function UserMovies({ userData, filters }: PageProps) {
    const filterStore = useFilterStore();

    useEffect(() => {
        if (filters) {
            filterStore.setStatus(filters.status || null);
            filterStore.setTitle(filters.title || null);
            filterStore.setDateRange([
                filters.from_date ? new Date(filters.from_date) : null,
                filters.to_date ? new Date(filters.to_date) : null,
            ]);
            filterStore.setGenres(
                filters.genres ? filters.genres.split(",").map(Number) : []
            );
        }
    }, []);

    return (
        <>
            <Head title={`${userData.username}'s Movies`} />
            <Space h={16} hiddenFrom="gtmd" />
            <Box hiddenFrom="gtmd">
                <FilterMobile contentType="movies" />
            </Box>
            <Space h={24} />
            <UserMovieLayout
                leftSection={<FilterDesktop />}
                rightSection={
                    <Stack px={12} py={10}>
                        <Title order={2} tt="uppercase" c="dimmed" p={2}>
                            Movies
                        </Title>
                        <Stack gap={4} visibleFrom="gtmd">
                            <FilterSearchInput contentType="movies" />
                        </Stack>
                        <UserMovieSection />
                    </Stack>
                }
            />
        </>
    );
}

UserMovies.layout = (page: any) => (
    <AuthenticatedLayout>
        <UserProfileLayout children={page} userData={page.props.userData} />
    </AuthenticatedLayout>
);

export default UserMovies;
