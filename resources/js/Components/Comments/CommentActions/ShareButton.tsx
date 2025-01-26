import { Button, Text } from "@mantine/core";
import { Share } from "lucide-react";

export function ShareButton() {
    return (
        <Button
            variant="transparent"
            size="xs"
            leftSection={<Share size={12} className="-mr-1" />}
            p={0}
            c="dimmed"
        >
            <Text size="xs" className="hover:underline">
                share
            </Text>
        </Button>
    );
}
