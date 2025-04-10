import { Accordion } from '@mantine/core';
import ScheduleDay from '@/Components/Schedule/ScheduleDay';
import EmptySchedule from '@/Components/Schedule/EmptySchedule';
import dayjs from 'dayjs';
import { ScheduleItem } from '@/propsHooks/useSchedulePageData';

interface ScheduleContentProps {
	schedules: ScheduleItem[];
}

export default function ScheduleContent({ schedules }: ScheduleContentProps) {
	const schedulesByDay = schedules.reduce((acc, schedule) => {
		const day = dayjs.unix(schedule.episode_date).format('YYYY-MM-DD');

		if (!acc[day]) {
			acc[day] = {
				date: day,
				formatted_date: dayjs
					.unix(schedule.episode_date)
					.format('MMMM D, YYYY'),
				day_of_week: dayjs.unix(schedule.episode_date).format('dddd'),
				schedules: [],
			};
		}

		acc[day].schedules.push(schedule);
		return acc;
	}, {} as Record<string, { date: string; formatted_date: string; day_of_week: string; schedules: ScheduleItem[] }>);

	// Convert to array and sort by date
	const groupedSchedules = Object.values(schedulesByDay).sort((a, b) =>
		a.date.localeCompare(b.date)
	);

	if (groupedSchedules.length === 0) {
		return <EmptySchedule />;
	}

	const validDays = groupedSchedules
		.map((day) => (day.schedules.length > 0 ? day.formatted_date : null))
		.filter((date): date is string => date !== null);

	return (
		<Accordion
			defaultValue={validDays}
			multiple
		>
			{groupedSchedules
				.map((day) => {
					if (day.schedules.length === 0) {
						return null;
					}

					return (
						<ScheduleDay
							key={day.formatted_date}
							day={day}
						/>
					);
				})
				.filter(Boolean)}
		</Accordion>
	);
}
