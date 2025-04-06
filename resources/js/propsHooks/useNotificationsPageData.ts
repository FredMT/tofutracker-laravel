import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { Notification } from "@/Components/Notifications/types/notifications";

export function useNotificationsPageData() {
	const props = useTypedPageProps();
	const allNotifications = props.data as unknown as Notification[];
	const shouldShowMarkAllAsRead = props.shouldShowMarkAllAsRead as unknown as boolean;

	return {
		initialNotifications: allNotifications,
		initialShouldShowMarkAllAsRead: shouldShowMarkAllAsRead,
	};
}