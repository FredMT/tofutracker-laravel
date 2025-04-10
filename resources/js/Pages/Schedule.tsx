import BoundedContainer from '@/Components/BoundedContainer';
import EmptySchedule from '@/Components/Schedule/EmptySchedule';
import ScheduleContent from '@/Components/Schedule/ScheduleContent';
import ScheduleHeader from '@/Components/Schedule/ScheduleHeader';
import ScheduleNavigationAndTitle from '@/Components/Schedule/ScheduleNavigationAndTitle';
import ScheduleSkeleton from '@/Components/Schedule/ScheduleSkeleton';
import { useScheduleFilterStore } from '@/Components/Schedule/store/useScheduleFilterStore';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { Deferred, Head } from '@inertiajs/react';
import { Space, Stack } from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect } from 'react';
import { useSchedulePageData } from '@/propsHooks/useSchedulePageData';

dayjs.extend(relativeTime);

function Schedule() {
	const { data } = useSchedulePageData();
	const { initFromUrl } = useScheduleFilterStore();

	useEffect(() => {
		initFromUrl();
	}, []);

	return (
		<>
			<Head title='Schedule' />
			<Space h={80} />

			<BoundedContainer>
				<Stack gap={8}>
					<Deferred
						data='data'
						fallback={<ScheduleSkeleton />}
					>
						{data ? (
							<>
								<ScheduleNavigationAndTitle counts={data.counts} />
								<ScheduleHeader counts={data.counts} />
								{data.schedules && data.schedules.length > 0 ? (
									<ScheduleContent schedules={data.schedules} />
								) : (
									<EmptySchedule />
								)}
							</>
						) : (
							<EmptySchedule />
						)}
					</Deferred>
				</Stack>
			</BoundedContainer>
		</>
	);
}

Schedule.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Schedule;
