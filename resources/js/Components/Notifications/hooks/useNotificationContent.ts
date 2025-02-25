import { Notification } from "@/Components/Notifications/types/notifications";
import { hasExtraContent } from "@/Components/Notifications/utils/notificationContent";

/**
 * Hook for handling notification content
 * @param notification The notification to process
 * @returns Object with content-related properties and methods
 */
export function useNotificationContent(notification: Notification) {
    /**
     * Determines if the notification has extra content to display
     */
    const shouldDisplayExtraContent = hasExtraContent(notification);

    return {
        shouldDisplayExtraContent,
    };
}
