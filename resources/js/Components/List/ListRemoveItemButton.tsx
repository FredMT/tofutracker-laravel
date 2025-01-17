import { ActionIcon } from "@mantine/core";
import { XIcon } from "lucide-react";
import { useListStore } from "@/stores/listStore";

interface ListRemoveItemButtonProps {
    itemId: number;
}

export function ListRemoveItemButton({ itemId }: ListRemoveItemButtonProps) {
    const { removeItem } = useListStore();

    return (
        <ActionIcon
            variant="filled"
            color="red"
            size="sm"
            radius="xl"
            onClick={() => removeItem(itemId)}
            style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
            }}
        >
            <XIcon size={14} />
        </ActionIcon>
    );
}
