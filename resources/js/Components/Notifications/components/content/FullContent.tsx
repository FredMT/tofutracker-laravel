import { Blockquote, Text } from "@mantine/core";
import { Notification } from "@/Components/Notifications/types/notifications";
import { getFormattedContent } from "@/Components/Notifications/utils/notificationContent";

interface Props {
    notification: Notification;
}

/**
 * Renders notification content in a full format with blockquote styling
 */
export default function FullContent({ notification }: Props) {
    const content = getFormattedContent(notification);

    if (!content) return null;

    return (
        <Blockquote p="xs">
            <Text lineClamp={3}>{content}</Text>
        </Blockquote>
    );
}
