import UserImage from "@/Components/UserImage";
import ProfileLayout from "@/Layouts/ProfileLayout";
import { Head, usePage } from "@inertiajs/react";
import { MoviePageProps, PageProps } from "@/types";
import { LibraryEntry } from "@/types";
import { Container, Divider, Group, Stack, Tabs, Text } from "@mantine/core";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useLibraryData } from "@/hooks/useLibraryData";
import { UserProfileHeader } from "@/Components/UserProfileHeader";
import { LibraryGrid } from "@/Components/LibraryGrid";

interface Props extends MoviePageProps {
    library: {
        data: LibraryEntry[];
        next_page: number | null;
        total: number;
        per_page: number;
    };
}

export default function UserProfile({ library: initialLibrary }: Props) {
    const { props } = usePage<PageProps>();
    const { library, isLoading, loadMore } = useLibraryData(initialLibrary);

    const infiniteScrollRef = useInfiniteScroll(
        loadMore,
        !isLoading && !!library.next_page
    );

    const rightContent = (
        <Stack>
            <Divider my={16} />
            <Group wrap="wrap" gap={36} align="center" justify="center">
                <Text>Joined July 2023</Text>
                <Text>893 hrs watched</Text>
                <Text>Action</Text>
                <Text>293 likes recieved</Text>
            </Group>
            <Divider my={16} />
            <Tabs defaultValue="movies" variant="outline">
                <Tabs.List grow>
                    <Tabs.Tab value="movies">Activity</Tabs.Tab>
                    <Tabs.Tab value="tv">Library</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="movies">
                    <LibraryGrid
                        entries={library.data}
                        isLoading={isLoading}
                        hasMore={!!library.next_page}
                        infiniteScrollRef={infiniteScrollRef}
                    />
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );

    return (
        <>
            <Head title="User Profile" />
            <UserImage />
            <Container size={1200}>
                <ProfileLayout
                    left={
                        <UserProfileHeader
                            username={props.auth.user.username}
                        />
                    }
                    right={rightContent}
                />
            </Container>
        </>
    );
}
