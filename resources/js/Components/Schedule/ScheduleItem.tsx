import { Box, Stack } from '@mantine/core';
import ScheduleItemInfo from '@/Components/Schedule/ScheduleItem/ScheduleItemInfo';
import ScheduleItemBanner from '@/Components/Schedule/ScheduleItem/ScheduleItemBanner';
import { ScheduleItem as ScheduleItemType } from '@/propsHooks/useSchedulePageData';

interface ScheduleItemProps {
	item: ScheduleItemType;
}

export default function ScheduleItem({ item }: ScheduleItemProps) {
	return (
		<Box
			w={238}
			h={229}
		>
			<Stack gap={0}>
				<ScheduleItemBanner item={item} />
				<ScheduleItemInfo item={item} />
			</Stack>
		</Box>
	);
}
