import {
    ActionIcon,
    Badge,
    Group,
    Image,
    Text,
    Button,
    Stack,
    Indicator,
} from "@mantine/core";
import { Plus } from "lucide-react";
import { useAddItemsStore } from "@/stores/addItemsStore";
import { useListStore } from "@/stores/listStore";
import { Link } from "@inertiajs/react";
import { useState } from "react";

interface CompactSearchResultItemProps {
    id: number;
    title: string;
    media_type: string;
    poster_path: string | null;
    listId: number;
    anime_type?: string;
    onItemAdded: (id: number) => void;
    isBeingAdded: boolean;
}

export function CompactSearchResultItem({
    id,
    title,
    media_type,
    poster_path,
    listId,
    anime_type,
    onItemAdded,
    isBeingAdded,
}: CompactSearchResultItemProps) {
    const { addItemToList } = useAddItemsStore();
    const { items } = useListStore();
    const [isLoading, setIsLoading] = useState(false);

    const isInList = items.some((item) => item.item_id === id);

    const handleAdd = () => {
        setIsLoading(true);
        addItemToList(listId, media_type, id, anime_type);
        onItemAdded(id);
    };

    const itemUrl = route(
        media_type === "movie"
            ? "movie.show"
            : media_type === "tv"
            ? "tv.show"
            : "anime.show",
        { id }
    );

    return (
        <Group wrap="nowrap" h={60} gap="sm">
            <Indicator
                disabled={!isInList}
                size={8}
                position="middle-start"
                offset={-10}
                color="blue"
            >
                <Link href={itemUrl} style={{ textDecoration: "none" }}>
                    <Image
                        src={
                            poster_path
                                ? `https://image.tmdb.org/t/p/w92${poster_path}`
                                : null
                        }
                        h={60}
                        w={40}
                        radius="sm"
                        loading="lazy"
                        alt={title}
                        fallbackSrc="https://placehold.co/40x60"
                    />
                </Link>
            </Indicator>
            <div style={{ flex: 1 }}>
                <Link
                    href={itemUrl}
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <Text size="sm" fw={500} lineClamp={1}>
                        {title}
                    </Text>
                </Link>
                <Badge size="sm" variant="light" radius="sm">
                    {media_type.toUpperCase()}
                </Badge>
            </div>
            <ActionIcon
                variant="light"
                color="blue"
                radius="xl"
                size="md"
                onClick={handleAdd}
                disabled={isBeingAdded || isLoading || isInList}
                loading={isBeingAdded || isLoading}
            >
                <Plus size={16} />
            </ActionIcon>
        </Group>
    );
}
