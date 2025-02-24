import FilterButtonGroup from "@/Components/UserProfile/Filter/FilterButtonGroup";
import AnimeCard from "@/Components/Shared/UserAnime/AnimeCard";
import { useFilterStore } from "@/hooks/useFilterStore";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { UserAnimePageProps } from "@/types/userAnime";
import { Head } from "@inertiajs/react";
import { Alert, Flex, Group, Space, Stack, Title } from "@mantine/core";
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
            filterStore.initializeFromFilters(filters);
        }
    }, []);

    return (
        <>
            <Head title={`${userData.username}'s Anime`} />
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
