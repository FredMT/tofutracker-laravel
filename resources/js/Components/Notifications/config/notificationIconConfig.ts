import { NotificationSimpleType } from "@/Components/Notifications/types/notifications";
import { LucideIcon, BellIcon } from "lucide-react";

/**
 * Configuration for notification icon display
 */
export interface NotificationIconConfig {
    /**
     * Display mode for the notification icon
     */
    displayMode: "icon" | "avatar";

    /**
     * Icon size configuration for different variants
     */
    sizes: {
        compact: {
            container: number;
            icon: number;
            avatar: string;
        };
        full: {
            container: number;
            icon: number;
            avatar: string;
        };
    };
}

/**
 * Default icon sizes for different display variants
 */
export const ICON_SIZES = {
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

/**
 * Default configuration for unknown notification types
 */
export const DEFAULT_ICON_CONFIG = {
    displayMode: "icon" as const,
    sizes: ICON_SIZES,
};
