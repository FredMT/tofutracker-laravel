import { Button, Menu } from "@mantine/core";
import { ListOrdered, Plus, Settings2, Trash2 } from "lucide-react";
import { useListStore } from "@/stores/listStore";
import { useAddItemsStore } from "@/stores/addItemsStore";
import { AddItemsModal } from "./AddItems/AddItemsModal";

interface ListEditMenuProps {
    listId: number;
    onOpenEditDetails: () => void;
}

export function ListEditMenu({ listId, onOpenEditDetails }: ListEditMenuProps) {
    const { setIsEditing, setIsRemoving } = useListStore();
    const { setIsOpen } = useAddItemsStore();

    return (
        <>
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Button>Edit List</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<Settings2 size={14} />}
                        onClick={onOpenEditDetails}
                    >
                        Edit Details
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<ListOrdered size={14} />}
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Order
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<Plus size={14} />}
                        onClick={() => setIsOpen(true)}
                    >
                        Add Items
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<Trash2 size={14} />}
                        onClick={() => setIsRemoving(true)}
                        color="red"
                    >
                        Remove Items
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            <AddItemsModal listId={listId} />
        </>
    );
}
