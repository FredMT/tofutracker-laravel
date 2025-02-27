import { Group, ActionIcon, Tooltip } from "@mantine/core";
import { ExternalLink, Lightbulb, Lock, Pencil } from "lucide-react";
import { router } from "@inertiajs/react";

interface ActionButtonsProps {
    /**
     * The URL to navigate to when the visit button is clicked
     */
    visitUrl: string;
    /**
     * Optional callback for the suggestions button
     */
    onSuggestions?: () => void;
    /**
     * Optional callback for the lock button
     */
    onLock?: () => void;
    /**
     * Optional callback for the edit button
     */
    onEdit?: () => void;
}

/**
 * Reusable component for action buttons in table rows
 */
export function ActionButtons({
    visitUrl,
    onSuggestions,
    onLock,
    onEdit,
}: ActionButtonsProps) {
    const handleVisit = () => {
        router.visit(visitUrl);
    };

    return (
        <Group gap="xs">
            <Tooltip label="Visit">
                <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={handleVisit}
                    aria-label="Visit"
                >
                    <ExternalLink size={16} />
                </ActionIcon>
            </Tooltip>

            <Tooltip label="Suggestions">
                <ActionIcon
                    variant="subtle"
                    color="yellow"
                    onClick={onSuggestions}
                    aria-label="Suggestions"
                >
                    <Lightbulb size={16} />
                </ActionIcon>
            </Tooltip>

            <Tooltip label="Lock">
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={onLock}
                    aria-label="Lock"
                >
                    <Lock size={16} />
                </ActionIcon>
            </Tooltip>

            <Tooltip label="Edit">
                <ActionIcon
                    variant="subtle"
                    color="green"
                    onClick={onEdit}
                    aria-label="Edit"
                >
                    <Pencil size={16} />
                </ActionIcon>
            </Tooltip>
        </Group>
    );
}
