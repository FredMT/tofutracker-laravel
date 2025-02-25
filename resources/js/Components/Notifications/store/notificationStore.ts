import { create } from "zustand";
import { normalizeNotificationType } from "@/Components/Notifications/utils/notifications";
import axios from "axios";
import {
    Notification,
    WebsocketNotification,
} from "@/Components/Notifications/types/notifications";

interface NotificationStore {
    notifications: Notification[];
    allNotifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    setAllNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    subscribeToNotifications: (userId: number) => () => void;
    updateNotificationReadStatus: (id: string, timestamp: string) => void;
    markAsRead: (notificationId: string) => Promise<boolean>;
}

/**
 * Normalizes a notification by ensuring it has the correct type
 */
const normalizeNotification = (notification: Notification): Notification => {
    try {
        return {
            ...notification,
            type: normalizeNotificationType(notification.type),
        };
    } catch (error) {
        return notification;
    }
};

/**
 * Removes duplicate notifications based on ID
 */
const removeDuplicates = (notifications: Notification[]): Notification[] => {
    const seen = new Set<string>();
    return notifications.filter((notification) => {
        if (!notification.id) {
            return false;
        }
        if (seen.has(notification.id)) {
            return false;
        }
        seen.add(notification.id);
        return true;
    });
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    allNotifications: [],

    setNotifications: (notifications) => {
        try {
            const normalizedNotifications = notifications.map(
                normalizeNotification
            );
            const uniqueNotifications = removeDuplicates(
                normalizedNotifications
            );
            set({ notifications: uniqueNotifications.slice(0, 5) });
        } catch (error) {
            console.error("Error setting notifications:", error);
        }
    },

    setAllNotifications: (notifications) => {
        try {
            const normalizedNotifications = notifications.map(
                normalizeNotification
            );
            const uniqueNotifications = removeDuplicates(
                normalizedNotifications
            );
            set({ allNotifications: uniqueNotifications });
        } catch (error) {
            console.error("Error setting all notifications:", error);
        }
    },

    addNotification: (notification) => {
        try {
            const normalizedNotification = normalizeNotification(notification);

            // Update notifications (dropdown)
            set((state) => {
                const newNotifications = removeDuplicates([
                    normalizedNotification,
                    ...state.notifications,
                ]);
                return { notifications: newNotifications.slice(0, 5) };
            });

            // Update allNotifications (notifications page)
            set((state) => {
                const newAllNotifications = removeDuplicates([
                    normalizedNotification,
                    ...state.allNotifications,
                ]);
                return { allNotifications: newAllNotifications };
            });
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    },

    updateNotificationReadStatus: (id: string, timestamp: string) => {
        try {
            set((state) => ({
                notifications: state.notifications.map((notification) =>
                    notification.id === id
                        ? { ...notification, read_at: timestamp }
                        : notification
                ),
                allNotifications: state.allNotifications.map((notification) =>
                    notification.id === id
                        ? { ...notification, read_at: timestamp }
                        : notification
                ),
            }));
        } catch (error) {
            console.error("Error updating notification read status:", error);
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            const response = await axios.post(
                `/notifications/${notificationId}/read`
            );
            if (response.data.success) {
                const timestamp = new Date().toISOString();
                get().updateNotificationReadStatus(notificationId, timestamp);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            return false;
        }
    },

    subscribeToNotifications: (userId: number) => {
        try {
            const channel = window.Echo.private(`App.Models.User.${userId}`);
            channel.notification(
                (websocketNotification: WebsocketNotification) => {
                    try {
                        if (!websocketNotification) {
                            return;
                        }

                        // Ensure the notification has required fields
                        const normalizedNotification = {
                            ...websocketNotification,
                            id:
                                websocketNotification.id ||
                                `temp-${Date.now()}`,
                            type: websocketNotification.type || "unknown",
                            read_at: null,
                            created_at:
                                websocketNotification.created_at ||
                                new Date().toISOString(),
                        };

                        get().addNotification(normalizedNotification);
                    } catch (error) {
                        console.error(
                            "Error processing websocket notification:",
                            error
                        );
                    }
                }
            );
            return () => channel.stopListening("notification");
        } catch (error) {
            console.error("Error subscribing to notifications:", error);
            return () => {}; // Return empty cleanup function
        }
    },
}));
