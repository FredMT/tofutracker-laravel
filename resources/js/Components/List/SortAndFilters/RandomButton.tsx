import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { ShuffleIcon } from "lucide-react";
import { useListStore } from "@/stores/listStore";

function RandomButton() {
    const { items } = useListStore();

    const handleRandomClick = () => {
        if (items.length === 0) return;

        const randomItem = items[Math.floor(Math.random() * items.length)];
        if (randomItem.link) {
            window.open(randomItem.link, "_blank");
        }
    };

    return (
        <Tooltip label="Visit random item in list">
            <ActionIcon
                size="lg"
                variant="subtle"
                onClick={handleRandomClick}
                disabled={items.length === 0}
            >
                <ShuffleIcon size={20} />
            </ActionIcon>
        </Tooltip>
    );
}

export default RandomButton;
