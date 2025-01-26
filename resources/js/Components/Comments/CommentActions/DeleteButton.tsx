import { Button, Modal, Text, Group, Stack } from "@mantine/core";
import { Trash2Icon } from "lucide-react";
import { useCommentStore } from "@/stores/commentStore";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Auth } from "@/types";
import { useDisclosure } from "@mantine/hooks";

interface DeleteButtonProps {
    commentId: string;
    authorUsername: string | null;
}

export function DeleteButton({ commentId, authorUsername }: DeleteButtonProps) {
    const deleteComment = useCommentStore((state) => state.deleteComment);
    const [isDeleting, setIsDeleting] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const { auth } = usePage<{ auth: Auth }>().props;
    const canDelete =
        auth.user?.username === authorUsername && auth.user?.email_verified_at;

    if (!canDelete) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteComment(commentId);
            close();
        } catch (error) {
            console.error("Failed to delete comment:", error);
        } finally {
            setIsDeleting(false);
        }
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
                <Stack gap="md">
                    <Text size="sm">
                        Are you sure you want to delete this comment? This
                        action cannot be undone.
                    </Text>
                    <Group justify="flex-end" gap="sm">
                        <Button
                            variant="default"
                            onClick={close}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            onClick={handleDelete}
                            loading={isDeleting}
                        >
                            Delete
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Button
                variant="transparent"
                color="red"
                p={0}
                size="xs"
                onClick={open}
            >
                delete
            </Button>
        </>
    );
}
