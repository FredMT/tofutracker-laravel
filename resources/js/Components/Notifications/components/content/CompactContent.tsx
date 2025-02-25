import { Text } from "@mantine/core";
import { Notification } from "@/Components/Notifications/types/notifications";
import { getFormattedContent } from "@/Components/Notifications/utils/notificationContent";

interface Props {
    notification: Notification;
}

/**
 * Renders notification content in a compact format
 */
export default function CompactContent({ notification }: Props) {
    const content = getFormattedContent(notification);

    if (!content) return null;

    return (
        <Text size="sm" c="dimmed" lineClamp={1}>
            {content}
        </Text>
    );
}
