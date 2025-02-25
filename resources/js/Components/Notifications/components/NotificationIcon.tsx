import { Notification } from "@/Components/Notifications/types/notifications";
import { useNotificationIcon } from "@/Components/Notifications/hooks/useNotificationIcon";
import AvatarIcon from "@/Components/Notifications/components/icons/AvatarIcon";
import SymbolIcon from "@/Components/Notifications/components/icons/SymbolIcon";

interface Props {
    notification: Notification;
    variant: "compact" | "full";
}

/**
 * Renders the appropriate icon for a notification based on its type and configuration
 */
export default function NotificationIcon({ notification, variant }: Props) {
    const {
        IconComponent,
        color,
        fill,
        stroke,
        sizes,
        shouldDisplayAvatar,
        getAvatarSource,
    } = useNotificationIcon(notification, variant);

    if (shouldDisplayAvatar) {
        const avatarUrl = getAvatarSource() || "";
        return (
            <AvatarIcon
                avatarUrl={avatarUrl}
                size={sizes.avatar}
                containerSize={sizes.container}
            />
        );
    }

    return (
        <SymbolIcon
            IconComponent={IconComponent}
            size={sizes.icon}
            containerSize={sizes.container}
            color={color}
            fill={fill}
            stroke={stroke}
        />
    );
}
