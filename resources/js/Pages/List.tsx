import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { ListPage } from "@/types/listPage";
import { Head, usePage } from "@inertiajs/react";
import { ListBanner } from "@/Components/List/ListBanner";
import { Stack, Title } from "@mantine/core";
import BoundedContainer from "@/Components/BoundedContainer";
import { ListItemGrid } from "@/Components/List/ListItemGrid";
import { PageProps } from "@/types";
import { useListStore } from "@/stores/listStore";
import { useEffect } from "react";
import { ListActions } from "@/Components/List/ListActions";

export default function List({ list }: { list: ListPage }) {
    const { auth } = usePage<PageProps>().props;
    const { items, setItems, setOriginalItems, handleOrderChange, isEditing } =
        useListStore();

    const isOwner = auth.user?.id === list.user.id;

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
                        <Title order={1}>{list.title}</Title>
                        <Title order={4} fw={300}>
                            {list.description}
                        </Title>
                        <ListActions listId={list.id} isOwner={isOwner} />
                    </Stack>
                    <ListItemGrid
                        items={items}
                        isEditing={isEditing}
                        onOrderChange={handleOrderChange}
                    />
                </Stack>
            </BoundedContainer>
        </>
    );
}

List.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
