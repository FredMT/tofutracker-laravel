import { CardFanReveal } from "@/Components/UserProfile/Activity/CardFanReveal";
import { Link } from "@inertiajs/react";
import {
    ActionIcon,
    AspectRatio,
    Box,
    Card,
    Grid,
    Group,
    Image,
    Stack,
    Text,
} from "@mantine/core";
import { useHover, useMediaQuery } from "@mantine/hooks";
import { Clock, MessageCircle } from "lucide-react";
import styles from "./ActivityListItem.module.css";
import { useActivityItemType } from "@/Components/UserProfile/Activity/hooks/useActivityItemType";
import { useActivityItemDetails } from "@/Components/UserProfile/Activity/hooks/useActivityItemDetails";
import { useActivityDescription } from "@/Components/UserProfile/Activity/hooks/useActivityDescription";
import { useActivityPoster } from "@/Components/UserProfile/Activity/hooks/useActivityPoster";
import { Activity } from "@/Components/UserProfile/Activity/activityType";
import { ActivityLike } from "@/Components/UserProfile/Activity/ActivityLike";

interface ActivityListItemProps {
    activity: Activity;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
    const posterPath = useActivityPoster(activity);
    const itemType = useActivityItemType(activity);
    const { itemLink, itemTitle } = useActivityItemDetails(activity);
    const description = useActivityDescription(activity, itemLink, itemTitle);
    const min_sm_width = useMediaQuery("(min-width: 640px)");
    const { hovered, ref } = useHover();

    const isEpisodeWatch =
        itemType === "tv_episode" || itemType === "anime_episode";
    const isListItemAdd = activity.activity_type === "list_item_add";

    const ImageComponent = () =>
        isEpisodeWatch ? (
            <AspectRatio ratio={16 / 9} w={100}>
                <Image
                    src={posterPath}
                    alt={activity.description}
                    loading="lazy"
                    radius="md"
                />
            </AspectRatio>
        ) : (
            <AspectRatio ratio={2 / 3} w={100}>
                <Image
                    src={posterPath}
                    alt={activity.description}
                    loading="lazy"
                    radius="md"
                />
            </AspectRatio>
        );

    return (
        <Card
            key={activity.id}
            radius="md"
            withBorder={false}
            p={8}
            className={styles.card}
        >
            <Grid>
                {min_sm_width && (
                    <Grid.Col span="content">
                        <Box
                            ref={ref}
                            className={styles.imageColumn}
                            data-expanded={hovered}
                        >
                            {isListItemAdd ? (
                                <CardFanReveal
                                    items={activity.metadata.items}
                                />
                            ) : (
                                posterPath &&
                                (itemLink ? (
                                    <Link href={itemLink}>
                                        <ImageComponent />
                                    </Link>
                                ) : (
                                    <ImageComponent />
                                ))
                            )}
                        </Box>
                    </Grid.Col>
                )}
                <Grid.Col span="auto">
                    <Stack gap={0} justify="flex-end" h="100%" pb={10}>
                        <Group
                            gap={4}
                            align="center"
                            wrap="wrap"
                            hiddenFrom="sm"
                        >
                            <Clock size={16} />
                            <Text size="sm">{activity.occurred_at_diff}</Text>
                        </Group>
                        <Text size="sm">{description}</Text>
                    </Stack>
                </Grid.Col>
                <Grid.Col span="content">
                    <Stack
                        gap={20}
                        align="flex-end"
                        justify={min_sm_width ? "space-between" : "flex-end"}
                        h="100%"
                    >
                        <Group
                            gap={4}
                            align="center"
                            wrap="wrap"
                            visibleFrom="sm"
                        >
                            <Clock size={16} />
                            <Text size="sm">{activity.occurred_at_diff}</Text>
                        </Group>
                        <Group gap={4} pb={10}>
                            <ActivityLike
                                activityId={activity.id}
                                initialLikesCount={activity.likes_count}
                                isLiked={activity.is_liked}
                            />
                            <Group gap={1}>
                                <ActionIcon variant="subtle">
                                    <MessageCircle size={16} />
                                </ActionIcon>
                                {/* TODO: Add comments */}
                                <Text size="xs">2</Text>
                            </Group>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Card>
    );
}
