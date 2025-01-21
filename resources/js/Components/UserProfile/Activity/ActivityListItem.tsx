import { Card, Group, Image, Stack, Text, AspectRatio } from "@mantine/core";
import { Link } from "@inertiajs/react";
import styles from "./ActivityListItem.module.css";

interface Activity {
    activity_type: string;
    id: number;
    description: string;
    occurred_at_diff: string;
    metadata: Record<string, any>;
}

interface ActivityListItemProps {
    activity: Activity;
}

function getPosterPath(activity: Activity): string | null {
    if (activity.metadata.poster_path) {
        switch (activity.metadata.poster_from) {
            case "anidb":
                return (
                    "https://anidb.net/images/main/" +
                    activity.metadata.poster_path
                );
            case "tmdb":
                return (
                    "https://image.tmdb.org/t/p/w500" +
                    activity.metadata.poster_path
                );
            case "tvdb":
                return (
                    "https://artworks.thetvdb.com" +
                    activity.metadata.poster_path
                );
            default:
                return null;
        }
    }
    return null;
}

function getItemType(activity: Activity): string | null {
    if (activity.activity_type === "movie_watch") {
        return "movie";
    }

    if (
        (activity.activity_type === "tv_watch" ||
            activity.activity_type === "anime_watch") &&
        activity.metadata.type
    ) {
        return activity.metadata.type;
    }

    return null;
}

function getItemLink(activity: Activity): string | null {
    const type = getItemType(activity);

    switch (type) {
        case "movie":
            return activity.metadata.movie_link || null;
        case "tv_episode":
            return activity.metadata.season_link || null;
        case "tv_season":
            return activity.metadata.season_link || null;
        case "tv_show":
            return activity.metadata.show_link || null;
        case "anime_episode":
            return activity.metadata.anime_link || null;
        case "anime_season":
            return activity.metadata.anime_link || null;
        default:
            return null;
    }
}

function getItemTitle(activity: Activity): string | null {
    const type = getItemType(activity);

    switch (type) {
        case "movie":
            return activity.metadata.movie_title || null;
        case "tv_episode":
            return activity.metadata.season_title || null;
        case "tv_season":
            return activity.metadata.season_title || null;
        case "tv_show":
            return activity.metadata.show_title || null;
        case "anime_episode":
            return activity.metadata.anime_title || null;
        case "anime_season":
            return activity.metadata.anime_title || null;
        default:
            return null;
    }
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
    const itemType = getItemType(activity);
    const isEpisodeWatch =
        itemType === "tv_episode" || itemType === "anime_episode";
    const itemLink = getItemLink(activity);
    const itemTitle = getItemTitle(activity);

    const ImageComponent = () =>
        isEpisodeWatch ? (
            <AspectRatio ratio={16 / 9} w={100}>
                <Image
                    src={getPosterPath(activity)}
                    alt={activity.description}
                    loading="lazy"
                    radius="md"
                />
            </AspectRatio>
        ) : (
            <AspectRatio ratio={2 / 3} w={67}>
                <Image
                    src={getPosterPath(activity)}
                    alt={activity.description}
                    loading="lazy"
                    radius="md"
                />
            </AspectRatio>
        );

    const renderDescription = () => {
        if (!itemLink || !itemTitle) {
            return <Text mt="xs">{activity.description}</Text>;
        }

        const parts = activity.description.split(itemTitle);
        return (
            <Text mt="xs">
                {parts[0]}
                <Link href={itemLink} className={styles.linkedTitle} prefetch>
                    {itemTitle}
                </Link>
                {parts[1]}
            </Text>
        );
    };

    return (
        <Card
            key={activity.id}
            radius="md"
            withBorder={false}
            p={8}
            className="styles.card"
        >
            <Group>
                {getPosterPath(activity) &&
                    (itemLink ? (
                        <Link href={itemLink}>
                            <ImageComponent />
                        </Link>
                    ) : (
                        <ImageComponent />
                    ))}
                <Stack gap={0}>
                    <Text size="sm" c="dimmed">
                        {activity.occurred_at_diff}
                    </Text>
                    {renderDescription()}
                </Stack>
            </Group>
        </Card>
    );
}
