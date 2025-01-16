import {Card, Group, Image, Stack, Text} from "@mantine/core";

interface Activity {
    id: number;
    description: string;
    occurred_at_diff: string;
    poster_path: string | null;
    poster_from: string | null;
}
interface ActivityListItemProps {
    activity: Activity;
}

function getPosterPath(activity: Activity) {
    if (activity.poster_path) {
        switch (activity.poster_from) {
            case "anidb":
                return "https://anidb.net/images/main/" + activity.poster_path;
            case "tmdb":
                return "https://image.tmdb.org/t/p/w500" + activity.poster_path;
        }
    }
    return null;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
    return (
        <Card
            key={activity.id}
            radius="md"
            withBorder={false}
            bg="transparent"
            py={2}
            px={0}
        >
            <Group>
                <Image
                    src={getPosterPath(activity)}
                    alt={activity.description}
                    height={100}
                    h={100}
                    w={67}
                    loading="lazy"
                    radius="md"
                />
                <Stack gap={0}>
                    <Text size="sm" c="dimmed">
                        {activity.occurred_at_diff}
                    </Text>
                    <Text mt="xs">{activity.description}</Text>
                </Stack>
            </Group>
        </Card>
    );
}
