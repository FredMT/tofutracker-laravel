import { Modal, Drawer, Stack, Text, Group, Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { router } from "@inertiajs/react";
import { useState } from "react";

interface ListDeleteProps {
    listId: number;
    username: string;
    opened: boolean;
    onClose: () => void;
}

export function ListDelete({
    listId,
    username,
    opened,
    onClose,
}: ListDeleteProps) {
    const isMobile = useMediaQuery("(max-width: 48em)");
    const [isConfirming, setIsConfirming] = useState(false);

    const handleDelete = () => {
        router.delete(
            route("user.lists.destroy", {
                username,
                list: listId,
            }),
            {
                onSuccess: () => {
                    setIsConfirming(false);
                    onClose();
                },
            }
        );
    };

    const initialContent = (
        <Stack gap="md">
            <Text>Are you sure you want to delete this list?</Text>
            <Group justify="flex-end" gap="sm">
                <Button variant="light" onClick={onClose}>
                    Cancel
                </Button>
                <Button color="red" onClick={() => setIsConfirming(true)}>
                    Delete List
                </Button>
            </Group>
        </Stack>
    );

    const confirmContent = (
        <Stack gap="md">
            <Text fw={500} c="red">
                This action cannot be undone.
            </Text>
            <Group justify="flex-end" gap="sm">
                <Button variant="light" onClick={() => setIsConfirming(false)}>
                    Go Back
                </Button>
                <Button color="red" onClick={handleDelete}>
                    Confirm Delete
                </Button>
            </Group>
        </Stack>
    );

    if (isMobile) {
        return (
            <>
                <Drawer
                    opened={opened && !isConfirming}
                    onClose={onClose}
                    title="Delete List"
                    position="bottom"
                    size="xs"
                >
                    {initialContent}
                </Drawer>
                <Drawer
                    opened={opened && isConfirming}
                    onClose={() => setIsConfirming(false)}
                    title="Confirm Delete"
                    position="bottom"
                    size="xs"
                >
                    {confirmContent}
                </Drawer>
            </>
        );
    }

    return (
        <>
            <Modal
                opened={opened && !isConfirming}
                onClose={onClose}
                title="Delete List"
                size="sm"
                centered
            >
                {initialContent}
            </Modal>
            <Modal
                opened={opened && isConfirming}
                onClose={() => setIsConfirming(false)}
                title="Confirm Delete"
                size="sm"
                centered
            >
                {confirmContent}
            </Modal>
        </>
    );
}
