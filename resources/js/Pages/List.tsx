import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { ListPage } from "@/types/listPage";
import { Head, Link, usePage } from "@inertiajs/react";
import { ListBanner } from "@/Components/List/ListBanner";
import { Stack, Title, Group, Anchor, Alert } from "@mantine/core";
import BoundedContainer from "@/Components/BoundedContainer";
import { ListItemGrid } from "@/Components/List/ListItemGrid";
import { PageProps } from "@/types";
import { useListStore } from "@/stores/listStore";
import { useEffect } from "react";
import { ListActions } from "@/Components/List/ListActions";
import { ListRemoveActions } from "@/Components/List/ListRemoveActions";
import { ListEditModal } from "@/Components/List/ListEditModal";
import { useDisclosure } from "@mantine/hooks";
import { ListStats } from "@/Components/List/ListStats";
import ListSortAndFiltersSection from "@/Components/List/SortAndFilters/ListSortAndFiltersSection";

export default function List({ list }: { list: ListPage }) {
    const { auth } = usePage<PageProps>().props;
    const {
        setItems,
        setOriginalItems,
        isEditing,
        isRemoving,
        items,
        handleOrderChange,
    } = useListStore();
    const [opened, { open, close }] = useDisclosure(false);

    const isOwner = list.user.id === auth.user?.id;

    useEffect(() => {
        setItems(list.items);
        setOriginalItems(list.items);
    }, [list.items]);

    return (
        <>
            <Head title={`${list.title} - ${list.user.username}'s List`} />
            <ListBanner
                bannerType={list.banner_type}
                listId={list.id}
                bannerImage={list.banner_image}
                listUserUsername={list.user.username}
                onOpenEditDetails={open}
                isEmpty={list.is_empty}
            />
            <BoundedContainer>
                <Stack gap="lg">
                    <Stack gap={8}>
                        <Group align="end">
                            <Title order={1}>{list.title}</Title>
                            <Anchor
                                component={Link}
                                href={route("user.profile", list.user.username)}
                                c="dimmed"
                            >{`Created by ${list.user.username}`}</Anchor>
                        </Group>
                        {list.description && (
                            <Title order={4} fw={300}>
                                {list.description}
                            </Title>
                        )}
                        <ListStats list={list} />
                        <Group justify="flex-end">
                            {isRemoving && (
                                <ListRemoveActions
                                    listId={list.id}
                                    isOwner={isOwner}
                                />
                            )}
                            {isEditing && (
                                <ListActions
                                    listId={list.id}
                                    isOwner={isOwner}
                                />
                            )}
                        </Group>
                    </Stack>
                    {!list.is_empty && (
                        <ListSortAndFiltersSection
                            listGenres={list.list_genres}
                        />
                    )}
                    {!list.is_empty ? (
                        <ListItemGrid
                            items={items}
                            isEditing={isEditing}
                            onOrderChange={handleOrderChange}
                        />
                    ) : (
                        <Alert>This list has no items.</Alert>
                    )}
                    {!list.is_empty && !items.length && (
                        <Alert>No items found for selected filters.</Alert>
                    )}
                </Stack>
            </BoundedContainer>
            <ListEditModal list={list} opened={opened} onClose={close} />
        </>
    );
}
List.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
