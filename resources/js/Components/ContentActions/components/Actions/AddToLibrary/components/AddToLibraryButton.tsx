import React from "react";
import { Button } from "@mantine/core";
import { PlusCircle } from "lucide-react";

type AddToLibraryButtonProps = {
    /** Handler for button click */
    onClick: () => void;
    /** Whether the button should show a loading state */
    processing: boolean;
    /** Custom text for the button (defaults to "Add to Library") */
    buttonText?: string;
};

/**
 * Button component for adding items to library
 */
export function AddToLibraryButton({
    onClick,
    processing,
    buttonText = "Add to Library",
}: AddToLibraryButtonProps) {
    return (
        <Button
            fullWidth
            variant="outline"
            leftSection={React.createElement(PlusCircle, { size: 14 })}
            onClick={onClick}
            disabled={processing}
        >
            {buttonText}
        </Button>
    );
}
