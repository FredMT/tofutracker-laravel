import {Button, Stack, TextInput} from "@mantine/core";
import {Plus, Search} from "lucide-react";
import {ListContentProps} from "@/Components/ContentActions/components/Actions/ManageCustomList/types";
import {ListItem} from "./components/ListItem";

export function ListContent({
    search,
    setSearch,
    filteredLists,
    openCreate,
}: ListContentProps) {
    return (
        <Stack gap="md">
            <TextInput
                placeholder="Search lists..."
                leftSection={<Search size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                mt={2}
            />

            <Stack gap="sm">
                {filteredLists.map((list) => (
                    <ListItem
                        key={list.id}
                        list={list}
                    />
                ))}
            </Stack>

            <Button
                variant="light"
                onClick={openCreate}
                leftSection={<Plus size={16} />}
            >
                Create New List
            </Button>
        </Stack>
    );
}
