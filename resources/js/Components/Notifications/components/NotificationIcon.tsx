import {
    getAvatarUrl,
    notificationConfig,
} from "@/Components/Notifications/config/notificationConfig";
import { Notification } from "@/Components/Notifications/types/notifications";
import {
    getNotificationUserInfo,
    normalizeNotificationType,
} from "@/Components/Notifications/utils/notifications";
import { Avatar, Box } from "@mantine/core";
import { BellIcon } from "lucide-react";

interface Props {
    notification: Notification;
    variant: "compact" | "full";
}

const ICON_SIZES = {
    compact: {
        container: 24,
        icon: 24,
        avatar: "sm",
    },
    full: {
        container: 32,
        icon: 32,
        avatar: "md",
    },
} as const;

// Default config for unknown notification types
const defaultConfig = {
    icon: BellIcon,
    displayMode: "icon",
    color: "gray",
    fill: undefined,
    stroke: undefined,
};

export default function NotificationIcon({ notification, variant }: Props) {
    const type = normalizeNotificationType(notification.type);
    // Use default config if the notification type is not configured
    const config =
        notificationConfig[type as keyof typeof notificationConfig] ||
        defaultConfig;
    const sizes = ICON_SIZES[variant];
    const userInfo = getNotificationUserInfo(notification);

    const IconComponent = config.icon;
    const containerStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    if (config.displayMode === "avatar" && userInfo) {
        return (
            <Box w={sizes.container} h={sizes.container} style={containerStyle}>
                <Avatar
                    src={getAvatarUrl(userInfo.username, userInfo.avatar)}
                    size={sizes.avatar}
                    radius="xl"
                />
            </Box>
        );
    }

    return (
        <Box w={sizes.container} h={sizes.container} style={containerStyle}>
            <IconComponent
                size={sizes.icon}
                color={config.color}
                fill={config.fill}
                stroke={config.stroke}
            />
        </Box>
    );
}
