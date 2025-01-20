import { Button, Group } from "@mantine/core";
import { useListStore } from "@/stores/listStore";
import { router } from "@inertiajs/react";

interface ListActionsProps {
    listId: number;
    isOwner: boolean;
}

export function ListActions({ listId, isOwner }: ListActionsProps) {
    const {
        isEditing,
        hasChanges,
        items,
        setIsEditing,
        resetToOriginal,
        setOriginalItems,
    } = useListStore();

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(
            route("list.updateOrder", { list: listId }),
            {
                items: items.map((item) => ({
                    id: item.id,
                    sort_order: item.sort_order,
                })),
            },
            {
                onSuccess: () => {
                    setOriginalItems(items);
                    setIsEditing(false);
                },
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleEditToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isEditing) {
            resetToOriginal();
        }
        setIsEditing(!isEditing);
    };

    if (!isOwner) return null;

    return (
        <Group justify="flex-end">
            {isEditing ? (
                <>
                    <Button
                        type="button"
                        variant="subtle"
                        onClick={handleEditToggle}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasChanges}
                    >
                        Save Changes
                    </Button>
                </>
            ) : (
                <Button type="button" onClick={handleEditToggle}>
                    Edit Order
                </Button>
            )}
        </Group>
    );
}
