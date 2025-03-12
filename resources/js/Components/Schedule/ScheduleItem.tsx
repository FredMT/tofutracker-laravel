import { ScheduleItem as ScheduleItemType } from "@/types/schedule";
import { Link } from "@inertiajs/react";
import { Box, Stack, Tooltip } from "@mantine/core";
import ScheduleItemBanner from "./ScheduleItem/ScheduleItemBanner";
import ScheduleItemInfo from "./ScheduleItem/ScheduleItemInfo";

interface FeaturedScheduleItemProps {
    item: ScheduleItemType;
}

export default function ScheduleItem({ item }: FeaturedScheduleItemProps) {
    return (
        <Box w={238} h={229}>
            <Stack gap={0}>
                <Tooltip label={item.title}>
                    {item.link ? (
                        <Link href={item.link}>
                            <ScheduleItemBanner item={item} />
                        </Link>
                    ) : (
                        <ScheduleItemBanner item={item} />
                    )}
                </Tooltip>
                <ScheduleItemInfo item={item} />
            </Stack>
        </Box>
    );
}
