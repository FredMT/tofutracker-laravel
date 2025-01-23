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
import { Clock, Heart, MessageCircle } from "lucide-react";
import styles from "./ActivityListItem.module.css";
import {
    Activity,
    useActivityDescription,
    useActivityItemDetails,
    useActivityItemType,
    useActivityPoster,
} from "./hooks";

interface ActivityListItemProps {
    activity: Activity;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
    const posterPath = useActivityPoster(activity);
    const itemType = useActivityItemType(activity);
    const { itemLink, itemTitle } = useActivityItemDetails(activity);
    const description = useActivityDescription(activity, itemLink, itemTitle);
    const hidePoster = useMediaQuery("(min-width: 640px)");
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
                {hidePoster && (
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
                        {description}
                    </Stack>
                </Grid.Col>
                <Grid.Col span="content">
                    <Stack
                        gap={20}
                        align="flex-end"
                        justify="space-between"
                        h="100%"
                    >
                        <Group gap={4} align="center" wrap="wrap">
                            <Clock size={16} />
                            <Text size="sm">{activity.occurred_at_diff}</Text>
                        </Group>
                        <Group gap={4} pb={10}>
                            <ActionIcon variant="subtle">
                                <Heart size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle">
                                <MessageCircle size={16} />
                            </ActionIcon>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Card>
    );
}
