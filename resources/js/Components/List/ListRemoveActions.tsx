import { Button, Group } from "@mantine/core";
import { useListStore } from "@/stores/listStore";
import { router } from "@inertiajs/react";

interface ListRemoveActionsProps {
    listId: number;
    isOwner: boolean;
}

export function ListRemoveActions({ listId, isOwner }: ListRemoveActionsProps) {
    const { isRemoving, hasChanges, removedItems, setIsRemoving } =
        useListStore();

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(
            route("list.removeItems", { list: listId }),
            {
                items: removedItems.map((item) => ({
                    id: item.id,
                })),
            },
            {
                onSuccess: () => {
                    setIsRemoving(false);
                },
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsRemoving(false);
    };

    if (!isOwner) return null;

    return (
        <Group justify="flex-end">
            {isRemoving ? (
                <>
                    <Button
                        type="button"
                        variant="subtle"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        color="red"
                        onClick={handleSave}
                        disabled={!hasChanges}
                    >
                        Save Changes
                    </Button>
                </>
            ) : (
                <Button type="button" onClick={() => setIsRemoving(true)}>
                    Remove Items
                </Button>
            )}
        </Group>
    );
}
