import { NotificationSimpleType } from "@/Components/Notifications/types/notifications";

/**
 * Configuration for how different notification types should display their content
 */
export interface NotificationContentConfig {
    /**
     * Whether this notification type has extra content to display
     */
    hasExtraContent: boolean;

    /**
     * Whether the content should be rendered as plain text (removes HTML tags)
     */
    renderAsPlainText: boolean;
}

/**
 * Configuration for each notification type's content display
 */
export const notificationContentConfig: Record<
    NotificationSimpleType,
    NotificationContentConfig
> = {
    reply: {
        hasExtraContent: true,
        renderAsPlainText: true,
    },
    commentreply: {
        hasExtraContent: true,
        renderAsPlainText: true,
    },
    vote_milestone: {
        hasExtraContent: false,
        renderAsPlainText: false,
    },
    unknown: {
        hasExtraContent: false,
        renderAsPlainText: false,
    },
};
