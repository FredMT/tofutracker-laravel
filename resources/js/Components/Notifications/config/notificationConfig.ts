import { NotificationSimpleType } from "@/Components/Notifications/types/notifications";
import {
    MessageSquareIcon,
    TrendingUpIcon,
    LucideIcon,
    ArrowBigUpIcon,
    BellIcon,
} from "lucide-react";

export interface NotificationTypeConfig {
    category: "user" | "achievement" | "system";
    icon: LucideIcon;
    displayMode: "icon" | "avatar";
    color: string;
    fill?: string;
    stroke?: string;
}

export const notificationConfig: Record<
    NotificationSimpleType,
    NotificationTypeConfig
> = {
    reply: {
        category: "user",
        icon: MessageSquareIcon,
        displayMode: "avatar",
        color: "blue",
    },
    commentreply: {
        category: "user",
        icon: MessageSquareIcon,
        displayMode: "avatar",
        color: "blue",
    },
    vote_milestone: {
        category: "achievement",
        icon: ArrowBigUpIcon,
        displayMode: "icon",
        color: "orange",
        fill: "orange",
        stroke: "orange",
    },
    unknown: {
        category: "system",
        icon: BellIcon,
        displayMode: "icon",
        color: "gray",
    },
};

export const getAvatarUrl = (
    username: string,
    avatarPath?: string | null
): string => {
    if (avatarPath) return avatarPath;
    return `https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${username}`;
};
