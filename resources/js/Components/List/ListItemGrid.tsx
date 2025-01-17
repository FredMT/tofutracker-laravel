import { Alert, Flex } from "@mantine/core";
import { ListItem } from "@/types/listPage";
import {
    closestCenter,
    defaultDropAnimationSideEffects,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { ListItemCard } from "@/Components/List/ListItemCard";
import { SortableListItem } from "@/Components/List/SortableListItem";
import { InfoIcon } from "lucide-react";

interface ListItemGridProps {
    items: ListItem[];
    isEditing?: boolean;
    onOrderChange?: (items: ListItem[]) => void;
}

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.5",
            },
        },
    }),
};

const dragOverlayStyle = {
    cursor: "grabbing",
    scale: "1.05",
    border: "2px solid var(--mantine-color-violet-filled)",
    borderRadius: "var(--mantine-radius-md)",
    zIndex: 1000,
    background: "var(--mantine-color-dark-7)",
};

export function ListItemGrid({
    items,
    isEditing = false,
    onOrderChange,
}: ListItemGridProps) {
    const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const [activeId, setActiveId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 0,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: DragStartEvent) {
        const id = Number(event.active.id);
        if (!isNaN(id)) {
            setActiveId(id);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = sortedItems.findIndex(
                (item) => item.id === active.id
            );
            const newIndex = sortedItems.findIndex(
                (item) => item.id === over.id
            );

            const newItems = arrayMove(sortedItems, oldIndex, newIndex).map(
                (item, index) => ({
                    ...item,
                    sort_order: index + 1,
                })
            );

            onOrderChange?.(newItems);
        }
    }

    function handleDragCancel() {
        setActiveId(null);
    }

    if (isEditing) {
        const activeItem = activeId
            ? sortedItems.find((item) => item.id === activeId)
            : null;

        return (
            <>
                <Alert
                    variant="light"
                    color="blue"
                    title="Hold and drag items to re-order them."
                    icon={<InfoIcon />}
                />
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <SortableContext
                        items={sortedItems.map((item) => item.id)}
                        strategy={rectSortingStrategy}
                    >
                        <Flex
                            gap="md"
                            justify="center"
                            align="flex-start"
                            wrap="wrap"
                        >
                            {sortedItems.map((item) => (
                                <SortableListItem key={item.id} item={item} />
                            ))}
                        </Flex>
                    </SortableContext>
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeItem ? (
                            <div style={dragOverlayStyle}>
                                <ListItemCard
                                    item={activeItem}
                                    isEditing={true}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </>
        );
    }

    return (
        <Flex gap="md" justify="center" align="flex-start" wrap="wrap">
            {sortedItems.map((item) => (
                <ListItemCard key={item.id} item={item} isEditing={isEditing} />
            ))}
        </Flex>
    );
}
