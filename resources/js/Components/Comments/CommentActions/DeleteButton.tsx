import { Button, Text } from "@mantine/core";

export function DeleteButton() {
    return (
        <Button variant="transparent" size="xs" p={0} c="dimmed">
            <Text size="xs" className="hover:underline" c="red">
                delete
            </Text>
        </Button>
    );
}
