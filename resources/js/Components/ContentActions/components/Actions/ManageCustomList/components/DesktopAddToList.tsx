import { Button, Modal } from "@mantine/core";
import { CreateListForm } from "@/Components/ContentActions/components/Actions/ManageCustomList/components/CreateListForm";
import { ListContent } from "@/Components/ContentActions/components/Actions/ManageCustomList/components/ListContent";
import { UserList } from "@/Components/ContentActions/components/Actions/ManageCustomList/types";

type DesktopAddToListProps = {
    opened: boolean;
    createOpened: boolean;
    close: () => void;
    closeCreate: () => void;
    open: () => void;
    openCreate: () => void;
    search: string;
    setSearch: (value: string) => void;
    filteredLists: UserList[];
    hasLists: boolean;
};

export default function DesktopAddToList({
    opened,
    createOpened,
    close,
    closeCreate,
    open,
    openCreate,
    search,
    setSearch,
    filteredLists,
    hasLists,
}: DesktopAddToListProps) {
    return (
        <>
            <Button variant="outline" onClick={open}>
                Add to List
            </Button>

            <Modal
                opened={opened}
                onClose={close}
                title="Add to List"
                size="md"
                centered
            >
                <ListContent
                    search={search}
                    setSearch={setSearch}
                    filteredLists={filteredLists}
                    openCreate={openCreate}
                    hasLists={hasLists}
                />
            </Modal>

            <Modal
                opened={createOpened}
                onClose={closeCreate}
                title="Create New List"
                size="md"
                centered
            >
                <CreateListForm closeCreate={closeCreate} />
            </Modal>
        </>
    );
}
