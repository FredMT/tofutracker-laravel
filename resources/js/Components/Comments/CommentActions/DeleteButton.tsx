import { Button, Text, Modal, Group } from "@mantine/core";
import { useCommentStore } from "@/stores/commentStore";
import { useDisclosure } from "@mantine/hooks";

interface DeleteButtonProps {
    commentId: string;
}

export function DeleteButton({ commentId }: DeleteButtonProps) {
    const { deleteComment } = useCommentStore();
    const [opened, { open, close }] = useDisclosure(false);

    const handleDelete = () => {
        deleteComment(commentId);
        close();
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title="Delete Comment"
                size="sm"
                centered
            >
                <Text size="sm" mb="lg">
                    Are you sure you want to delete this comment? This action
                    cannot be undone.
                </Text>
                <Group justify="flex-end" gap="sm">
                    <Button variant="default" onClick={close} size="xs">
                        Cancel
                    </Button>
                    <Button color="red" onClick={handleDelete} size="xs">
                        Delete
                    </Button>
                </Group>
            </Modal>

            <Button
                variant="transparent"
                size="xs"
                p={0}
                c="dimmed"
                onClick={open}
            >
                <Text size="xs" className="hover:underline" c="red">
                    delete
                </Text>
            </Button>
        </>
    );
}
