import type {
    Notification,
    NotificationFullType,
    NotificationSimpleType,
    ReplyNotification,
    WebsocketNotification,
    NotificationData,
} from "@/Components/Notifications/types/notifications";

/**
 * Normalizes a notification type to a simple string format
 */
export function normalizeNotificationType(
    type: NotificationSimpleType | NotificationFullType | string
): NotificationSimpleType | string {
    // Handle undefined or null type
    if (!type) {
        console.warn("Received notification with undefined or null type");
        return "unknown";
    }

    try {
        if (type.includes("\\")) {
            const normalizedType = type
                .split("\\")
                .pop()
                ?.toLowerCase()
                .replace("notification", "");

            return normalizedType || "unknown";
        }
        return type;
    } catch (error) {
        console.error("Error normalizing notification type:", error);
        return "unknown";
    }
}

/**
 * Type guard to check if a notification is a reply notification
 */
export function isReplyNotification(
    notification: Notification
): notification is ReplyNotification {
    const type = normalizeNotificationType(notification.type);
    return type === "reply" || type === "commentreply";
}

/**
 * Gets notification data regardless of the notification structure
 */
export function getNotificationData(
    notification: Notification
): NotificationData {
    // If it's a database notification with data property
    if ("data" in notification && notification.data) {
        return notification.data;
    }

    // If it's a websocket notification with direct properties
    const websocketNotification = notification as WebsocketNotification;
    return {
        comment_id: websocketNotification.comment_id,
        reply_id: websocketNotification.reply_id,
        link: websocketNotification.link,
        replier: websocketNotification.replier,
        content: websocketNotification.content,
        score_milestone: websocketNotification.score_milestone,
    };
}

/**
 * Gets user info from a notification
 */
export function getNotificationUserInfo(notification: Notification) {
    if (isReplyNotification(notification)) {
        const data = getNotificationData(notification);
        if (!data.replier) {
            return {
                username: "Unknown User",
                avatar: null,
            };
        }
        return {
            username: data.replier.username,
            avatar: data.replier.avatar,
        };
    }
    return null;
}

/**
 * Gets a human-readable content string for a notification
 */
export const getHumanReadableNotificationContent = (notification: Notification) => {
    const type = normalizeNotificationType(notification.type);
    const data = getNotificationData(notification);

    switch (type) {
        case "reply":
        case "commentreply":
            return data.replier?.username
                ? `${data.replier.username} replied to your comment`
                : `Someone replied to your comment`;
        case "vote_milestone":
            return `Your comment reached ${data.score_milestone} votes!`;
        default:
            return `New notification received`;
    }
};

/**
 * Gets the content data from a notification
 */
export function getNotificationContentData(notification: Notification) {
    const data = getNotificationData(notification);

    return {
        content: data.content || null,
    };
}
