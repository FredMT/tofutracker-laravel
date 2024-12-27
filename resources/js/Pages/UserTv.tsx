import TvCard from "@/Components/Shared/UserTv/TvCard";
import FilterButtonGroup from "@/Components/UserProfile/Filter/FilterButtonGroup";
import { useFilterStore } from "@/hooks/useFilterStore";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { UserData } from "@/types/userData";
import { UserTvShow } from "@/types/userTv";
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

interface Props {
    userData: UserData;
    filters: {
        status: string | null;
        title: string | null;
        from_date: string | null;
        to_date: string | null;
        genres: string | null;
    };
    shows: UserTvShow[];
    genres: { id: number; name: string }[];
    messages: string[];
    errors: string[];
    success: boolean;
}

function UserTv({ userData, filters, shows, messages }: Props) {
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
            <Head title={`${userData.username}'s Shows`} />
            <Divider my={16} />
            <Group>
                <FilterButtonGroup contentType="anime" />
            </Group>
            <Space h={12} />

            <Stack gap={12}>
                <Title order={2}>TV Shows</Title>
                {messages.length > 0 ? (
                    <Alert variant="light" color="blue">
                        {messages[0]}
                    </Alert>
                ) : (
                    <Flex gap={6} wrap="wrap" justify="flex-start">
                        {shows.map((show) => (
                            <TvCard key={show.id} show={show} />
                        ))}
                    </Flex>
                )}
            </Stack>
            <Space h={20} />
        </>
    );
}

UserTv.layout = (page: any) => (
    <AuthenticatedLayout>
        <UserProfileLayout children={page} userData={page.props.userData} />
    </AuthenticatedLayout>
);

export default UserTv;
