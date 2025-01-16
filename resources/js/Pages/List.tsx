import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import {ListPage} from "@/types/listPage";
import {Head, router, usePage} from "@inertiajs/react";
import {ListBanner} from "@/Components/List/ListBanner";
import {Button, Group, Stack, Title} from "@mantine/core";
import BoundedContainer from "@/Components/BoundedContainer";
import {ListItemGrid} from "@/Components/List/ListItemGrid";
import {useCallback, useRef, useState} from "react";
import {PageProps} from "@/types";

function List({ list }: { list: ListPage }) {
    const { auth } = usePage<PageProps>().props;
    const [isEditing, setIsEditing] = useState(false);
    const [items, setItems] = useState(list.items);
    const [hasChanges, setHasChanges] = useState(false);
    const originalItems = useRef(list.items);

    const isOwner = auth.user?.id === list.user.id;

    const handleOrderChange = useCallback((newItems: typeof items) => {
        const hasOrderChanged = newItems.some((item) => {
            const originalItem = originalItems.current.find(
                (i) => i.id === item.id
            );
            return originalItem && originalItem.sort_order !== item.sort_order;
        });

        setItems(newItems);
        setHasChanges(hasOrderChanged);
    }, []);

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(
            route("list.updateOrder", { list: list.id }),
            {
                items: items.map((item) => ({
                    id: item.id,
                    sort_order: item.sort_order,
                })),
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    setHasChanges(false);
                    originalItems.current = items;
                },
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleEditToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isEditing) {
            setItems(originalItems.current);
            setHasChanges(false);
        }
        setIsEditing(!isEditing);
    };

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
                        {isOwner && (
                            <Group justify="flex-end">
                                {isEditing ? (
                                    hasChanges ? (
                                        <Group>
                                            <Button
                                                onClick={handleSave}
                                                color="green"
                                                disabled={!hasChanges}
                                            >
                                                Save Changes
                                            </Button>
                                            <Button
                                                onClick={handleEditToggle}
                                                color="red"
                                            >
                                                Cancel
                                            </Button>
                                        </Group>
                                    ) : (
                                        <Button
                                            onClick={handleEditToggle}
                                            color="red"
                                        >
                                            Cancel Edit
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        onClick={handleEditToggle}
                                        color="blue"
                                    >
                                        Edit Order
                                    </Button>
                                )}
                            </Group>
                        )}
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

export default List;
