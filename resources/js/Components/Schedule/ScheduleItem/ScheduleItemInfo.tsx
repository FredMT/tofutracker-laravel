import { ScheduleItem } from "@/types/schedule";
import { Badge, Group, Paper, Space, Text } from "@mantine/core";
import dayjs from "dayjs";
import styles from "./Schedule.module.css";
import { Link } from "@inertiajs/react";

function ScheduleItemInfo({ item }: { item: ScheduleItem }) {
    return (
        <Paper className={styles.scheduleInfoBox} p={10} h={96}>
            <Group gap={8}>
                <Badge
                    size="sm"
                    variant="gradient"
                    bg={item.type === "tv" ? "teal" : "grape"}
                >
                    {item.type}
                </Badge>
                {item.season_number && (
                    <Badge size="sm" bg="#C084FC" c="black">
                        {`Season ${item.season_number}`}
                    </Badge>
                )}
                <Badge size="sm" bg="#FACC15" c="black">
                    {`Episode ${item.episode_number}`}
                </Badge>
            </Group>
            <Space h={12} />
            <Link href={item.link}>
                {item.episode_name ? (
                    <Text size="sm" lineClamp={1}>
                        {item.episode_name}
                    </Text>
                ) : (
                    <Text size="sm" lineClamp={1}>
                        {`Episode ${item.episode_number}`}
                    </Text>
                )}
            </Link>

            <Space h={10} />
            <Text size="sm" c="dimmed">
                {dayjs(item.episode_date).fromNow()}
            </Text>
        </Paper>
    );
}

export default ScheduleItemInfo;
