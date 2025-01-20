import {Button, Group, Modal, Text} from "@mantine/core";
import {useForm} from "@inertiajs/react";
import React from "react";

interface RemoveBannerModalProps {
    listId: number;
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function RemoveBannerModal({
    listId,
    opened,
    onClose,
    onSuccess,
}: RemoveBannerModalProps) {
    const { delete: destroy, processing } = useForm();

    const handleRemove = () => {
        destroy(route("list.banner.remove", { list: listId }), {
            onSuccess: () => {
                onSuccess?.();
                onClose();
            },
            preserveScroll: true,
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Remove Banner" centered>
            <Text>Are you sure you want to remove this banner?</Text>
            <Group justify="flex-end" mt="md">
                <Button
                    variant="subtle"
                    onClick={onClose}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button color="red" onClick={handleRemove} loading={processing}>
                    Remove
                </Button>
            </Group>
        </Modal>
    );
}
