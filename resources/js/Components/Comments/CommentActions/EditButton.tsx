import { Button, Text } from "@mantine/core";
import { usePage } from "@inertiajs/react";
import { Auth } from "@/types";

interface EditButtonProps {
    onEdit: () => void;
    authorUsername: string | null;
}

export function EditButton({ onEdit, authorUsername }: EditButtonProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const canEdit =
        auth.user?.username === authorUsername && auth.user?.email_verified_at;

    if (!canEdit) return null;

    return (
        <Button
            variant="transparent"
            size="xs"
            p={0}
            c="dimmed"
            onClick={onEdit}
        >
            <Text size="xs" className="hover:underline">
                edit
            </Text>
        </Button>
    );
}
