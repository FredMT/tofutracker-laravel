import ScheduleCountSummary from "@/Components/Schedule/ScheduleItem/ScheduleCountSummary";
import ScheduleTypeFilterBadges from "@/Components/Schedule/ScheduleTypeFilterBadges";
import { TypeCounts } from "@/types/schedule";
import { Space } from "@mantine/core";

interface ScheduleHeaderProps {
    counts: TypeCounts;
}

export default function ScheduleHeader({ counts }: ScheduleHeaderProps) {
    return (
        <>
            <ScheduleCountSummary counts={counts} />

            <Space h={4} />

            <ScheduleTypeFilterBadges interactive />
        </>
    );
}
