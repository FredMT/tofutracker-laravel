import TvCard from "@/Components/Shared/UserTv/TvCard";
import FilterButtonGroup from "@/Components/UserProfile/Filter/FilterButtonGroup";
import { useFilterStore } from "@/hooks/useFilterStore";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { UserData } from "@/types/userData";
import { UserTvShow } from "@/types/userTv";
import { Head } from "@inertiajs/react";
import { Alert, Flex, Group, Space, Stack, Title } from "@mantine/core";
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
            filterStore.initializeFromFilters(filters);
        }
    }, []);

    return (
        <>
            <Head title={`${userData.username}'s Shows`} />
            <Group>
                <FilterButtonGroup contentType="tv" />
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
