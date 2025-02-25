import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { useNotificationStore } from "../store/notificationStore";

interface MarkAllAsReadResponse {
    success: boolean;
    message: string;
}

export const useMarkAllAsReadMutation = () => {
    const queryClient = useQueryClient();
    const { allNotifications } = useNotificationStore();

    const updateStoreNotifications = () => {
        const { updateNotificationReadStatus } =
            useNotificationStore.getState();

        const timestamp = new Date().toISOString();

        allNotifications.forEach((notification) => {
            if (notification.read_at === null) {
                updateNotificationReadStatus(notification.id, timestamp);
            }
        });
    };

    return useMutation({
        mutationFn: async (): Promise<MarkAllAsReadResponse> => {
            const response = await axios.post<MarkAllAsReadResponse>(
                route("notifications.readAll")
            );
            return response.data;
        },
        onSuccess: (data: MarkAllAsReadResponse) => {
            if (data.success) {
                updateStoreNotifications();

                notifications.show({
                    title: "Success",
                    message: data.message || "All notifications marked as read",
                    color: "green",
                });

                queryClient.invalidateQueries({ queryKey: ["notifications"] });
            } else {
                notifications.show({
                    title: "Error",
                    message:
                        data.message || "Failed to mark notifications as read",
                    color: "red",
                });
            }
        },
        onError: (error: any) => {
            notifications.show({
                title: "Error",
                message:
                    error.response?.data?.message ||
                    "Failed to mark notifications as read",
                color: "red",
            });
        },
    });
};
