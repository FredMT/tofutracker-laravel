import { ScheduleItem as ScheduleItemType } from "@/types/schedule";
import { Box, Stack } from "@mantine/core";
import ScheduleItemInfo from "@/Components/Schedule/ScheduleItem/ScheduleItemInfo";
import ScheduleItemBanner from "@/Components/Schedule/ScheduleItem/ScheduleItemBanner";

interface FeaturedScheduleItemProps {
    item: ScheduleItemType;
}

export default function ScheduleItem({ item }: FeaturedScheduleItemProps) {
    return (
        <Box w={238} h={229}>
            <Stack gap={0}>
                <ScheduleItemBanner item={item} />
                <ScheduleItemInfo item={item} />
            </Stack>
        </Box>
    );
}
