import { Blockquote, Text } from "@mantine/core";
import type { Notification } from "@/Components/Notifications/types/notifications";
import {
    isReplyNotification,
    normalizeNotificationType,
    getNotificationContentData,
} from "@/Components/Notifications/utils/notifications";

interface Props {
    notification: Notification;
    variant: "compact" | "full";
}

interface ContentConfig {
    render: (
        notification: Notification,
        variant: "compact" | "full"
    ) => React.ReactNode;
}

const contentConfigs: Partial<Record<string, ContentConfig>> = {
    reply: {
        render: (notification, variant) => {
            if (!isReplyNotification(notification)) return null;

            const data = getNotificationContentData(notification);
            if (!data.content) return null;

            const plainText = data.content.replace(/<[^>]*>/g, "");

            if (variant === "compact") {
                return (
                    <Text size="sm" c="dimmed" lineClamp={1}>
                        {plainText}
                    </Text>
                );
            }

            return (
                <Blockquote p="xs">
                    <Text lineClamp={3}>{plainText}</Text>
                </Blockquote>
            );
        },
    },
    // Add support for commentreply type which is the same as reply
    commentreply: {
        render: (notification, variant) => {
            const data = getNotificationContentData(notification);
            if (!data.content) return null;

            const plainText = data.content.replace(/<[^>]*>/g, "");

            if (variant === "compact") {
                return (
                    <Text size="sm" c="dimmed" lineClamp={1}>
                        {plainText}
                    </Text>
                );
            }

            return (
                <Blockquote p="xs">
                    <Text lineClamp={3}>{plainText}</Text>
                </Blockquote>
            );
        },
    },
};

export default function NotificationExtraContent({
    notification,
    variant,
}: Props) {
    const type = normalizeNotificationType(notification.type);
    const config = type ? contentConfigs[type] : null;
    if (!config) return null;

    return config.render(notification, variant);
}
