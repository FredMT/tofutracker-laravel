import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {ListItem} from "@/types/listPage";
import {ListItemCard} from "@/Components/List/ListItemCard";

interface ListSortableItemProps {
    item: ListItem;
}

export function ListSortableItem({ item }: ListSortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        opacity: isDragging ? 0 : 1,
        touchAction: "none",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <ListItemCard item={item} isEditing={true} />
        </div>
    );
}
