import { Button, Drawer } from "@mantine/core";
import { CreateListForm } from "@/Components/ContentActions/components/Actions/ManageCustomList/components/CreateListForm";
import { ListContent } from "@/Components/ContentActions/components/Actions/ManageCustomList/components/ListContent";
import { UserList } from "@/Components/ContentActions/components/Actions/ManageCustomList/types";

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
    hasLists: boolean;
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
    hasLists,
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
                        openCreate={openCreate}
                        hasLists={hasLists}
                    />
                </Drawer>

                <Drawer
                    opened={createOpened}
                    onClose={closeCreate}
                    title="Create New List"
                    position="bottom"
                >
                    <CreateListForm closeCreate={closeCreate} />
                </Drawer>
            </Drawer.Stack>
        </>
    );
}
