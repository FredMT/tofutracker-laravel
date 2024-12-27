import FilterButtonGroup from "@/Components/UserProfile/Filter/FilterButtonGroup";
import AnimeCard from "@/Components/Shared/UserAnime/AnimeCard";
import { useFilterStore } from "@/hooks/useFilterStore";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { UserAnimePageProps } from "@/types/userAnime";
import { Head } from "@inertiajs/react";
import {
    Alert,
    Divider,
    Flex,
    Group,
    Space,
    Stack,
    Title,
} from "@mantine/core";
import { useEffect } from "react";

function UserAnime({
    userData,
    filters,
    collections,
    messages,
}: UserAnimePageProps) {
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
            <Head title={`${userData.username}'s Anime`} />
            <Divider my={16} />
            <Group>
                <FilterButtonGroup contentType="anime" />
            </Group>
            <Space h={12} />
            <Stack gap={12}>
                <Title order={2}>Anime</Title>
                {messages.length > 0 && (
                    <Alert variant="light" color="blue">
                        {messages[0]}
                    </Alert>
                )}
                <Flex gap={6} wrap="wrap" justify="flex-start">
                    {collections.map((collection) => (
                        <AnimeCard
                            key={collection.id}
                            collection={collection}
                        />
                    ))}
                </Flex>
            </Stack>
        </>
    );
}

UserAnime.layout = (page: any) => (
    <AuthenticatedLayout>
        <UserProfileLayout children={page} userData={page.props.userData} />
    </AuthenticatedLayout>
);

export default UserAnime;
