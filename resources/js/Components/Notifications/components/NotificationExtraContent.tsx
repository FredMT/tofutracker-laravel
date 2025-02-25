import type { Notification } from "@/Components/Notifications/types/notifications";
import { useNotificationContent } from "@/Components/Notifications/hooks/useNotificationContent";
import CompactContent from "@/Components/Notifications/components/content/CompactContent";
import FullContent from "@/Components/Notifications/components/content/FullContent";

interface Props {
    notification: Notification;
    variant: "compact" | "full";
}

/**
 * Renders additional content for a notification based on its type and variant
 */
export default function NotificationExtraContent({
    notification,
    variant,
}: Props) {
    const { shouldDisplayExtraContent } = useNotificationContent(notification);

    if (!shouldDisplayExtraContent) return null;

    return variant === "compact" ? (
        <CompactContent notification={notification} />
    ) : (
        <FullContent notification={notification} />
    );
}
