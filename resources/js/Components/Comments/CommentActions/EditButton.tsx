import { Button, Text } from "@mantine/core";

interface EditButtonProps {
    onEdit: () => void;
}

export function EditButton({ onEdit }: EditButtonProps) {
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
