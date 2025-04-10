import { Accordion, Flex, Group, Space, Text } from '@mantine/core';
import ScheduleItem from '@/Components/Schedule/ScheduleItem';
import { ScheduleItem as ScheduleItemType } from '@/propsHooks/useSchedulePageData';

interface DayData {
	date: string;
	formatted_date: string;
	day_of_week: string;
	schedules: ScheduleItemType[];
}

interface ScheduleDayProps {
	day: DayData;
}

export default function ScheduleDay({ day }: ScheduleDayProps) {
	return (
		<Accordion.Item
			key={day.formatted_date}
			value={day.formatted_date}
		>
			<Accordion.Control>
				<Group>
					<Text fw={600}>{`${day.day_of_week} ${day.formatted_date}`}</Text>
				</Group>
			</Accordion.Control>
			<Space h={8} />
			<Accordion.Panel>
				<Flex
					gap='md'
					wrap='wrap'
				>
					{day.schedules.map((item) => (
						<ScheduleItem
							key={`${item.id}-${item.episode_date}`}
							item={item}
						/>
					))}
				</Flex>
			</Accordion.Panel>
		</Accordion.Item>
	);
}
