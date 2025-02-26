import React from "react";
import { Button, Group, Modal, useModalsStack } from "@mantine/core";
import { Trash2 } from "lucide-react";

type RemoveFromLibraryButtonProps = {
    /** Handler for button click */
    handleRemove: () => void;
    /** Whether the button is in a processing state */
    processing: boolean;
    /** Custom text for the button (defaults to "Remove from Library") */
    buttonText?: string;
    /** Custom modal title (defaults to "Remove from Library?") */
    modalTitle?: string;
    /** Custom modal content (defaults to a generic message) */
    modalContent?: React.ReactNode;
};

/**
 * Button component for removing items from library
 */
export function RemoveFromLibraryButton({
    handleRemove,
    processing,
    buttonText = "Remove from Library",
    modalTitle = "Remove from Library?",
    modalContent = "Are you sure you want to remove this item from your library?",
}: RemoveFromLibraryButtonProps) {
    const stack = useModalsStack(["confirm-delete"]);

    return (
        <>
            <Modal.Stack>
                <Modal {...stack.register("confirm-delete")} title={modalTitle}>
                    {modalContent}
                    <Group mt="lg" justify="flex-end">
                        <Button
                            onClick={stack.closeAll}
                            variant="default"
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                handleRemove();
                                stack.closeAll();
                            }}
                            color="red"
                            loading={processing}
                            disabled={processing}
                        >
                            Remove
                        </Button>
                    </Group>
                </Modal>
            </Modal.Stack>

            <Button
                fullWidth
                color="red"
                variant="outline"
                leftSection={<Trash2 size={14} />}
                onClick={() => stack.open("confirm-delete")}
                disabled={processing}
            >
                {buttonText}
            </Button>
        </>
    );
}
