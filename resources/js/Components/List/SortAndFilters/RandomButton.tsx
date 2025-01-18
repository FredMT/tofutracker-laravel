import { Button } from "@mantine/core";
import { ShuffleIcon } from "lucide-react";
import { useListStore } from "@/stores/listStore";
import { router } from "@inertiajs/react";

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
        <Button
            leftSection={<ShuffleIcon size={16} />}
            size="sm"
            variant="outline"
            onClick={handleRandomClick}
            disabled={items.length === 0}
        >
            Random
        </Button>
    );
}

export default RandomButton;
