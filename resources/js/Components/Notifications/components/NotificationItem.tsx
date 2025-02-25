import { useNotificationStore } from "@/Components/Notifications/store/notificationStore";
import {
    getNotificationContent,
    getNotificationData,
} from "@/Components/Notifications/utils/notifications";
import { Notification } from "@/Components/Notifications/types/notifications";
import { Link } from "@inertiajs/react";
import { Group, Indicator, Stack, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import dayjs from "dayjs";
import { useEffect } from "react";
import NotificationExtraContent from "@/Components/Notifications/components/NotificationExtraContent";
import NotificationIcon from "@/Components/Notifications/components/NotificationIcon";

interface Props {
    notification: Notification;
    variant?: "compact" | "full";
}

export default function NotificationItem({
    notification,
    variant = "compact",
}: Props) {
    const { markAsRead } = useNotificationStore();
    const { hovered, ref } = useHover();
    const notificationData = getNotificationData(notification);

    useEffect(() => {
        if (notification.read_at === null && hovered) {
            markAsRead(notification.id);
        }
    }, [hovered, notification.id, notification.read_at, markAsRead]);

    const content = (
        <Group gap={variant === "compact" ? "xs" : "sm"} align="start">
            <NotificationIcon notification={notification} variant={variant} />
            <Stack gap={variant === "compact" ? 2 : "xs"} style={{ flex: 1 }}>
                <Text size={variant === "compact" ? "sm" : "md"} lh={1.4}>
                    {getNotificationContent(notification)}
                </Text>
                <NotificationExtraContent
                    notification={notification}
                    variant={variant}
                />
                <Text size="xs" c="dimmed">
                    {dayjs(notification.created_at).fromNow()}
                </Text>
            </Stack>
        </Group>
    );

    const wrappedContent =
        notification.read_at === null ? (
            <Indicator size={10} color="pink" position="middle-end" withBorder>
                {content}
            </Indicator>
        ) : (
            content
        );

    if (variant === "full") {
        return (
            <Link
                href={notificationData.link ?? ""}
                className="block hover:bg-white-500/20 dark:hover:bg-gray-900/10 transition-colors"
            >
                <div ref={ref} className="p-4">
                    {wrappedContent}
                </div>
            </Link>
        );
    }

    return (
        <Link href={notificationData.link ?? ""}>
            <div ref={ref}>{wrappedContent}</div>
        </Link>
    );
}
