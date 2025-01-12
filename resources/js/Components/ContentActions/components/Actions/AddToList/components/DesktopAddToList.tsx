import { Button, Modal } from "@mantine/core";
import { CreateForm } from "@/Components/ContentActions/components/Actions/AddToList/components/CreateForm";
import { ListContent } from "@/Components/ContentActions/components/Actions/AddToList/components/ListContent";
import { UserList } from "@/Components/ContentActions/components/Actions/AddToList/types";

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
    handleAddToList: (id: number) => void;
    handleGoToList: (id: number) => void;
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
    handleAddToList,
    handleGoToList,
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
                    handleAddToList={handleAddToList}
                    handleGoToList={handleGoToList}
                    openCreate={openCreate}
                />
            </Modal>

            <Modal
                opened={createOpened}
                onClose={closeCreate}
                title="Create New List"
                size="md"
                centered
            >
                <CreateForm closeCreate={closeCreate} />
            </Modal>
        </>
    );
}
