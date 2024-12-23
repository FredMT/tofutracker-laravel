import { Badge, Group, Tabs, Text } from "@mantine/core";
import classes from "./TabItem.module.css";

type TabValue = "movies" | "tv" | "anime";

interface TabItemProps {
    label: string;
    count?: number;
    value: TabValue;
}

export default function TabItem({ label, count, value }: TabItemProps) {
    return (
        <Tabs.Tab value={value} py={20} px={0} className={classes.tab}>
            <Group gap={8}>
                <Text>{label}</Text>
                {count && count > 0 && <Badge size="lg">{count}</Badge>}
            </Group>
        </Tabs.Tab>
    );
}
