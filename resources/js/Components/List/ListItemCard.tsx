import { Card } from "@mantine/core";
import { Link } from "@inertiajs/react";
import { ListItem } from "@/types/listPage";
import ListItemCardContent from "./ListItemCardContent";
import { useListStore } from "@/stores/listStore";
import { ListRemoveItemButton } from "./ListRemoveItemButton";

interface ListItemCardProps {
    item: ListItem;
    isEditing?: boolean;
}

export function ListItemCard({ item, isEditing = false }: ListItemCardProps) {
    const { isRemoving } = useListStore();

    const imageUrl =
        item.poster_type === "tmdb"
            ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.poster_path}`
            : `https://anidb.net/images/main/${item.poster_path}`;

    const content = (
        <ListItemCardContent
            imageUrl={imageUrl}
            title={item.title}
            year={item.year}
            voteAverage={item.vote_average}
        />
    );

    return (
        <Card
            radius="md"
            w={140}
            withBorder={false}
            style={{ background: "rgba(0, 0, 0, 0)", position: "relative" }}
            shadow="none"
        >
            {isRemoving && <ListRemoveItemButton itemId={item.id} />}
            {item.link && !isEditing && !isRemoving ? (
                <Link href={item.link} prefetch>
                    {content}
                </Link>
            ) : (
                content
            )}
        </Card>
    );
}
