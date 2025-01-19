import { Button, Stack, TextInput, Text } from "@mantine/core";
import { Plus, Search } from "lucide-react";
import { ListContentProps } from "@/Components/ContentActions/components/Actions/ManageCustomList/types";
import { ListItem } from "./components/ListItem";

export function ListContent({
    search,
    setSearch,
    filteredLists,
    openCreate,
    hasLists,
}: ListContentProps) {
    return (
        <Stack gap="md">
            {hasLists && (
                <TextInput
                    placeholder="Search lists..."
                    leftSection={<Search size={16} />}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    mt={2}
                />
            )}

            <Stack gap="sm">
                {hasLists ? (
                    filteredLists.map((list) => (
                        <ListItem key={list.id} list={list} />
                    ))
                ) : (
                    <Text c="dimmed" ta="center">
                        You have no lists, create one!
                    </Text>
                )}
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
