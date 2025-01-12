import {
    ActionIcon,
    Group,
    Indicator,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { ChevronRight, Plus, Search } from "lucide-react";
import { ListContentProps } from "../types";
import { Button } from "@mantine/core";

export function ListContent({
    search,
    setSearch,
    filteredLists,
    handleAddToList,
    handleGoToList,
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
                    <Group key={list.id} justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap">
                            <Indicator
                                color="blue"
                                disabled={!list.has_item}
                                size={8}
                            />
                            <Text lineClamp={1}>{list.title}</Text>
                        </Group>
                        <Group gap="xs">
                            <ActionIcon
                                variant="subtle"
                                onClick={() => handleAddToList(list.id)}
                                disabled={list.has_item}
                            >
                                <Plus size={16} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                onClick={() => handleGoToList(list.id)}
                            >
                                <ChevronRight size={16} />
                            </ActionIcon>
                        </Group>
                    </Group>
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
