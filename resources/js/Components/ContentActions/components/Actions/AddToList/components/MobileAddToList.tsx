import { Button, Drawer } from "@mantine/core";
import { CreateForm } from "@/Components/ContentActions/components/Actions/AddToList/components/CreateForm";
import { ListContent } from "@/Components/ContentActions/components/Actions/AddToList/components/ListContent";
import { UserList } from "@/Components/ContentActions/components/Actions/AddToList/types";

type MobileAddToListProps = {
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

export default function MobileAddToList({
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
}: MobileAddToListProps) {
    return (
        <>
            <Button variant="outline" onClick={open}>
                Add to List
            </Button>

            <Drawer.Stack>
                <Drawer
                    opened={opened}
                    onClose={close}
                    title="Add to List"
                    position="bottom"
                    size="sm"
                >
                    <ListContent
                        search={search}
                        setSearch={setSearch}
                        filteredLists={filteredLists}
                        handleAddToList={handleAddToList}
                        handleGoToList={handleGoToList}
                        openCreate={openCreate}
                    />
                </Drawer>

                <Drawer
                    opened={createOpened}
                    onClose={closeCreate}
                    title="Create New List"
                    position="bottom"
                >
                    <CreateForm closeCreate={closeCreate} />
                </Drawer>
            </Drawer.Stack>
        </>
    );
}
