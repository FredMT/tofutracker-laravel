import MarkAllAsReadButton from '@/Components/Notifications/components/MarkAllAsReadButton';
import NotificationItem from '@/Components/Notifications/components/NotificationItem';
import { useNotificationStore } from '@/Components/Notifications/store/notificationStore';
import { useAuth } from '@/propsHooks/useAuth';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { useNotificationsPageData } from '@/propsHooks/useNotificationsPageData';
import { Head, router } from '@inertiajs/react';
import { Container, Divider, Group, Space, Stack, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

function Notifications() {
	const auth = useAuth();

	const { initialNotifications, initialShouldShowMarkAllAsRead } =
		useNotificationsPageData();

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

	useEffect(() => {
		const hasUnreadNotifications = allNotifications.some(
			(notification) => notification.read_at === null
		);
		setShouldShowMarkAllAsRead(hasUnreadNotifications);
	}, [allNotifications]);

	if (!auth.user) {
		router.visit('/login');
		return null;
	}

	return (
		<>
			<Head title='Notifications' />
			<Space h={64} />
			<Container size='lg'>
				<>
					<Stack py={12}>
						<div className='flex items-center justify-between'>
							<Group
								justify='space-between'
								w='100%'
							>
								<Title order={2}>Notifications</Title>
								{shouldShowMarkAllAsRead && (
									<MarkAllAsReadButton
										onSuccess={() => setShouldShowMarkAllAsRead(false)}
									/>
								)}
							</Group>
						</div>
						<Divider />
						{allNotifications.length === 0 ? (
							<div className='py-8 text-center text-gray-500'>
								No notifications
							</div>
						) : (
							<div className='divide-y divide-gray-400 dark:divide-gray-800 transition-colors'>
								{allNotifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										variant='full'
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
