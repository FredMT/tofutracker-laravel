import { ActionIcon, Group, Indicator, Text } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import RemoveFromList from "@/Components/ContentActions/components/Actions/ManageCustomList/components/components/RemoveFromList";
import AddToList from "@/Components/ContentActions/components/Actions/ManageCustomList/components/components/AddToList";
import { UserList } from "@/Components/ContentActions/components/Actions/ManageCustomList/types";

interface ListItemProps {
    list: UserList;
}

export function ListItem({ list }: ListItemProps) {
    return (
        <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
                <Indicator color="blue" disabled={!list.has_item} size={8} />
                <Text lineClamp={1}>{list.title}</Text>
            </Group>
            <Group gap="xs">
                {list.has_item ? (
                    <RemoveFromList list={list} />
                ) : (
                    <AddToList list={list} />
                )}
                <ActionIcon
                    variant="subtle"
                    component={Link}
                    href={route("welcome")}
                >
                    <ChevronRight size={16} />
                </ActionIcon>
            </Group>
        </Group>
    );
}
