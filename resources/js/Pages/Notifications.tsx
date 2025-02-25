import MarkAllAsReadButton from "@/Components/Notifications/components/MarkAllAsReadButton";
import NotificationItem from "@/Components/Notifications/components/NotificationItem";
import { useNotificationStore } from "@/Components/Notifications/store/notificationStore";
import { Notification } from "@/Components/Notifications/types/notifications";
import { useUser } from "@/hooks/useUser";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { Container, Divider, Group, Space, Stack, Title } from "@mantine/core";
import { useEffect, useState } from "react";

type Props = PageProps & {
    allNotifications: Notification[];
    shouldShowMarkAllAsRead: boolean;
};

function Notifications() {
    const user = useUser();
    const {
        allNotifications: initialNotifications,
        shouldShowMarkAllAsRead: initialShouldShowMarkAllAsRead,
    } = usePage<Props>().props;

    const [shouldShowMarkAllAsRead, setShouldShowMarkAllAsRead] = useState(
        initialShouldShowMarkAllAsRead
    );
    const { setAllNotifications, allNotifications } = useNotificationStore();

    useEffect(() => {
        setAllNotifications(initialNotifications);
    }, [initialNotifications]);

    useEffect(() => {
        setShouldShowMarkAllAsRead(initialShouldShowMarkAllAsRead);
    }, [initialShouldShowMarkAllAsRead]);

    // Check if there are any unread notifications
    useEffect(() => {
        const hasUnreadNotifications = allNotifications.some(
            (notification) => notification.read_at === null
        );
        setShouldShowMarkAllAsRead(hasUnreadNotifications);
    }, [allNotifications]);

    if (!user) {
        router.visit("/login");
        return null;
    }

    return (
        <>
            <Head title="Notifications" />
            <Space h={64} />
            <Container size="lg">
                <>
                    <Stack py={12}>
                        <div className="flex items-center justify-between">
                            <Group justify="space-between" w="100%">
                                <Title order={2}>Notifications</Title>
                                {shouldShowMarkAllAsRead && (
                                    <MarkAllAsReadButton
                                        onSuccess={() =>
                                            setShouldShowMarkAllAsRead(false)
                                        }
                                    />
                                )}
                            </Group>
                        </div>
                        <Divider />
                        {allNotifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-400 dark:divide-gray-800 transition-colors">
                                {allNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        variant="full"
                                    />
                                ))}
                            </div>
                        )}
                    </Stack>
                </>
            </Container>
        </>
    );
}

Notifications.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Notifications;
