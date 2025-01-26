import { Button, Text } from "@mantine/core";

interface ReplyButtonProps {
    onReply: () => void;
}

export function ReplyButton({ onReply }: ReplyButtonProps) {
    return (
        <Button
            variant="transparent"
            size="xs"
            p={0}
            c="dimmed"
            onClick={onReply}
        >
            <Text size="xs" className="hover:underline">
                reply
            </Text>
        </Button>
    );
}
