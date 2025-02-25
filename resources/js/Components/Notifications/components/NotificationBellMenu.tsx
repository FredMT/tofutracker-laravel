import { useNotificationStore } from "@/Components/Notifications/store/notificationStore";
import { Link, router, usePage } from "@inertiajs/react";
import {
    ActionIcon,
    Group,
    Menu,
    Space,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BellIcon } from "lucide-react";
import { useEffect } from "react";
import NotificationItem from "./NotificationItem";
import { PageProps } from "@/types";
import { Notification } from "@/Components/Notifications/types/notifications";

dayjs.extend(relativeTime);

type Props = PageProps & {
    notifications: Notification[];
};

export default function NotificationBellMenu() {
    const { notifications, setNotifications, subscribeToNotifications } =
        useNotificationStore();
    const isMobile = useMediaQuery("(max-width: 640px)");

    const {
        auth: { user },
        notifications: initialNotifications,
    } = usePage<Props>().props;
    const component = usePage<PageProps>().component;

    useEffect(() => {
        if (initialNotifications?.length) {
            setNotifications(initialNotifications);
        }
    }, [initialNotifications]);

    useEffect(() => {
        if (!user?.id) return;

        const unsubscribe = subscribeToNotifications(user.id);
        return () => {
            unsubscribe();
        };
    }, [user?.id]);

    if (!user?.id || component === "Notifications") return null;

    const handleBellClick = () => {
        if (isMobile) {
            router.visit("/notifications");
        }
    };

    return (
        <Menu
            shadow="md"
            position="bottom-end"
            transitionProps={{
                transition: "rotate-right",
                duration: 150,
            }}
        >
            <Menu.Target>
                <ActionIcon
                    size="lg"
                    variant="outline"
                    onClick={handleBellClick}
                >
                    <BellIcon size={16} />
                </ActionIcon>
            </Menu.Target>

            {!isMobile && (
                <Menu.Dropdown mih={100} w={350} p={16}>
                    <Group justify="space-between">
                        <Title order={4}>Notifications</Title>
                        <Link href="/notifications">
                            <Text size="xs" td="underline">
                                View all
                            </Text>
                        </Link>
                    </Group>
                    <Space h={12} />
                    {notifications.length === 0 ? (
                        <Text c="dimmed" size="sm" ta="center">
                            No notifications
                        </Text>
                    ) : (
                        <Stack gap="xs">
                            {notifications.map((notification) => (
                                <div key={`menu-${notification.id}`}>
                                    <Menu.Item>
                                        <NotificationItem
                                            notification={notification}
                                            variant="compact"
                                        />
                                    </Menu.Item>
                                </div>
                            ))}
                        </Stack>
                    )}
                </Menu.Dropdown>
            )}
        </Menu>
    );
}
