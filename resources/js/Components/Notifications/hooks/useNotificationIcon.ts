import { Notification } from "@/Components/Notifications/types/notifications";
import {
    normalizeNotificationType,
    getNotificationUserInfo,
} from "@/Components/Notifications/utils/notifications";
import { notificationConfig } from "@/Components/Notifications/config/notificationConfig";
import {
    DEFAULT_ICON_CONFIG,
    ICON_SIZES,
} from "@/Components/Notifications/config/notificationIconConfig";
import { getAvatarUrl } from "@/Components/Notifications/config/notificationConfig";

/**
 * Hook for handling notification icon display
 * @param notification The notification to process
 * @param variant The display variant (compact or full)
 * @returns Object with icon-related properties and methods
 */
export function useNotificationIcon(
    notification: Notification,
    variant: "compact" | "full"
) {
    const type = normalizeNotificationType(notification.type);
    const config = notificationConfig[
        type as keyof typeof notificationConfig
    ] || {
        icon: DEFAULT_ICON_CONFIG.displayMode,
        displayMode: DEFAULT_ICON_CONFIG.displayMode,
        color: "gray",
    };

    const sizes = ICON_SIZES[variant];
    const userInfo = getNotificationUserInfo(notification);

    /**
     * Determines if the notification should display an avatar
     */
    const shouldDisplayAvatar = config.displayMode === "avatar" && !!userInfo;

    /**
     * Gets the avatar URL for the notification user
     */
    const getAvatarSource = () => {
        if (!userInfo) return null;
        return getAvatarUrl(userInfo.username, userInfo.avatar);
    };

    return {
        IconComponent: config.icon,
        color: config.color,
        fill: config.fill,
        stroke: config.stroke,
        sizes,
        shouldDisplayAvatar,
        getAvatarSource,
    };
}
