import { Button } from "@mantine/core";
import { ArrowLeft } from "lucide-react";

interface ViewAllCommentsButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

export function ViewAllCommentsButton({
    onClick,
    isLoading,
}: ViewAllCommentsButtonProps) {
    return (
        <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={onClick}
            loading={isLoading}
            className="mb-4"
        >
            View all comments
        </Button>
    );
}
