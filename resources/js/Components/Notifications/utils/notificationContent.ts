import { Notification } from "@/Components/Notifications/types/notifications";
import { getNotificationContentData } from "@/Components/Notifications/utils/notifications";
import { notificationContentConfig } from "@/Components/Notifications/config/notificationContentConfig";
import { normalizeNotificationType } from "@/Components/Notifications/utils/notifications";

/**
 * Extracts and formats the content from a notification
 * @param notification The notification to extract content from
 * @returns The formatted content or null if no content is available
 */
export function getFormattedContent(notification: Notification): string | null {
    const data = getNotificationContentData(notification);
    if (!data.content) return null;

    const type = normalizeNotificationType(notification.type);
    const config =
        notificationContentConfig[
            type as keyof typeof notificationContentConfig
        ];

    if (config?.renderAsPlainText) {
        return stripHtmlTags(data.content);
    }

    return data.content;
}

/**
 * Removes HTML tags from a string
 * @param html HTML string to clean
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, "");
}

/**
 * Checks if a notification has extra content to display
 * @param notification The notification to check
 * @returns True if the notification has extra content
 */
export function hasExtraContent(notification: Notification): boolean {
    const type = normalizeNotificationType(notification.type);
    const config =
        notificationContentConfig[
            type as keyof typeof notificationContentConfig
        ];

    if (!config) return false;

    return config.hasExtraContent && !!getFormattedContent(notification);
}
