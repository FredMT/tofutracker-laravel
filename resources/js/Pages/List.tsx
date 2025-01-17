import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { ListPage } from "@/types/listPage";
import { Head, Link, usePage } from "@inertiajs/react";
import { ListBanner } from "@/Components/List/ListBanner";
import { Stack, Title, Group, Anchor } from "@mantine/core";
import BoundedContainer from "@/Components/BoundedContainer";
import { ListItemGrid } from "@/Components/List/ListItemGrid";
import { PageProps } from "@/types";
import { useListStore } from "@/stores/listStore";
import { useEffect } from "react";
import { ListActions } from "@/Components/List/ListActions";
import { RemoveActions } from "@/Components/List/RemoveActions";
import { EditListModal } from "@/Components/List/EditListModal";
import { useDisclosure } from "@mantine/hooks";
import { ListEditMenu } from "@/Components/List/ListEditMenu";
import { ListStats } from "@/Components/List/ListStats";

export default function List({ list }: { list: ListPage }) {
    const { auth } = usePage<PageProps>().props;
    const { setItems, setOriginalItems, isEditing, isRemoving } =
        useListStore();
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
                        <Group justify="flex-end">
                            {isOwner && !isEditing && !isRemoving && (
                                <ListEditMenu
                                    onOpenEditDetails={open}
                                    listId={list.id}
                                />
                            )}
                            {isEditing && (
                                <ListActions
                                    listId={list.id}
                                    isOwner={isOwner}
                                />
                            )}
                            {isRemoving && (
                                <RemoveActions
                                    listId={list.id}
                                    isOwner={isOwner}
                                />
                            )}
                        </Group>
                    </Stack>
                    <ListStats list={list} />
                    <ListItemGrid items={list.items} isEditing={isEditing} />
                </Stack>
            </BoundedContainer>
            <EditListModal list={list} opened={opened} onClose={close} />
        </>
    );
}

List.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
