import { useMarkAllAsReadMutation } from "@/Components/Notifications/hooks/useMarkAllAsReadMutation";
import { Button } from "@mantine/core";

interface Props {
    onSuccess?: () => void;
}

export default function MarkAllAsReadButton({ onSuccess }: Props) {
    const { mutate, isPending } = useMarkAllAsReadMutation();

    const handleClick = () => {
        mutate(undefined, {
            onSuccess: () => {
                onSuccess?.();
            },
        });
    };

    return (
        <Button
            onClick={handleClick}
            loading={isPending}
            color="violet.9"
            disabled={isPending}
        >
            Mark all as read
        </Button>
    );
}
