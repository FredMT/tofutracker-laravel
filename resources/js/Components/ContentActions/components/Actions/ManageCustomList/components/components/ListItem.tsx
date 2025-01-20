import {ActionIcon, Grid, Group, Indicator, Text, Tooltip,} from "@mantine/core";
import {ChevronRight} from "lucide-react";
import {Link} from "@inertiajs/react";
import RemoveFromList
    from "@/Components/ContentActions/components/Actions/ManageCustomList/components/components/RemoveFromList";
import AddToList from "@/Components/ContentActions/components/Actions/ManageCustomList/components/components/AddToList";
import {UserList} from "@/Components/ContentActions/components/Actions/ManageCustomList/types";

interface ListItemProps {
    list: UserList;
}

export function ListItem({ list }: ListItemProps) {
    return (
        <Grid>
            <Grid.Col span={9}>
                <Group gap="sm">
                    <Indicator
                        color="blue"
                        disabled={!list.has_item}
                        size={8}
                    />
                    <Tooltip label={list.title}>
                        <Text>
                            {list.title.slice(0, 20)}
                            {list.title.length > 20 ? "..." : ""}
                        </Text>
                    </Tooltip>
                </Group>
            </Grid.Col>
            <Grid.Col span={3}>
                <Group gap="xs" justify="flex-end">
                    {list.has_item ? (
                        <RemoveFromList list={list} />
                    ) : (
                        <AddToList list={list} />
                    )}
                    <ActionIcon
                        variant="subtle"
                        component={Link}
                        href={route("list.show", list.id)}
                    >
                        <ChevronRight size={16} />
                    </ActionIcon>
                </Group>
            </Grid.Col>
        </Grid>
    );
}
