import { useMemo } from "react";
import { Link } from "@inertiajs/react";
import { Text, Tooltip } from "@mantine/core";
import { Activity } from "./types";
import styles from "../ActivityListItem.module.css";

export const useActivityDescription = (
    activity: Activity,
    itemLink: string | null,
    itemTitle: string | null
) => {
    return useMemo(() => {
        if (activity.activity_type !== "list_item_add") {
            if (!itemLink || !itemTitle) {
                return <Text mt="xs">{activity.description}</Text>;
            }

            const parts = activity.description.split(itemTitle);
            return (
                <Text mt="xs">
                    {parts[0]}
                    <Link
                        href={itemLink}
                        className={styles.linkedTitle}
                        prefetch
                    >
                        {itemTitle}
                    </Link>
                    {parts[1]}
                </Text>
            );
        }

        const { items } = activity.metadata;
        const listTitle = activity.metadata.list_title;
        const listLink = `/list/${activity.metadata.list_id}`;

        if (items.length <= 2) {
            const itemLinks = items.map((item: any, index: number) => (
                <>
                    <Link
                        href={item.link}
                        className={styles.linkedTitle}
                        prefetch
                    >
                        {item.title}
                    </Link>
                    {index === 0 && items.length === 2 && " and "}
                </>
            ));

            return (
                <Text mt="xs">
                    Added {itemLinks} to{" "}
                    <Link
                        href={listLink}
                        className={styles.linkedTitle}
                        prefetch
                    >
                        {listTitle}
                    </Link>
                </Text>
            );
        }

        const remainingItems = items.slice(2);
        const remainingTitles = remainingItems
            .map((item: any) => item.title)
            .join(", ");
        const tooltipLabel = `Other items: ${remainingTitles}`;

        return (
            <Text mt="xs">
                Added{" "}
                <Link
                    href={items[0].link}
                    className={styles.linkedTitle}
                    prefetch
                >
                    {items[0].title}
                </Link>
                ,{" "}
                <Link
                    href={items[1].link}
                    className={styles.linkedTitle}
                    prefetch
                >
                    {items[1].title}
                </Link>
                {" and "}
                <Tooltip
                    label={tooltipLabel}
                    multiline
                    w={300}
                    position="top"
                    withArrow
                >
                    <span>{remainingItems.length} more items</span>
                </Tooltip>
                {" to "}
                <Link href={listLink} className={styles.linkedTitle} prefetch>
                    {listTitle}
                </Link>
            </Text>
        );
    }, [activity, itemLink, itemTitle]);
};
