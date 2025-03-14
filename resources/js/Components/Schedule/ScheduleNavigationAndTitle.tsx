import { Button, Group, Title } from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TypeCounts } from "@/types/schedule";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { router } from "@inertiajs/react";

import { useScheduleFilterStore } from "@/Components/Schedule/store/useScheduleFilterStore";
import {
    SCHEDULE_DAYS_SKIP_NEXT,
    SCHEDULE_DAYS_SKIP_PREVIOUS,
} from "@/Components/Schedule/constants/schedule";

dayjs.extend(isSameOrBefore);

interface ScheduleNavigationAndTitleProps {
    counts: TypeCounts;
}

const ScheduleNavigationAndTitle = ({
    counts,
}: ScheduleNavigationAndTitleProps) => {
    const { formatted_start_date, formatted_end_date } = counts;
    const { activeFilter } = useScheduleFilterStore();

    const startDate = dayjs(formatted_start_date);
    const endDate = dayjs(formatted_end_date);
    const currentDate = dayjs();

    const showPrevButton = startDate.isAfter(currentDate, "day");

    const handlePrevClick = () => {
        const prevDate = startDate.subtract(SCHEDULE_DAYS_SKIP_PREVIOUS, "day");

        if (prevDate.isSameOrBefore(currentDate, "day")) {
            const params = activeFilter ? { type: activeFilter } : {};
            router.visit(route("schedule.index", params));
        } else {
            const prevWeekStartDate = prevDate.format("YYYY-MM-DD");
            const params = {
                ...(activeFilter ? { type: activeFilter } : {}),
                date: prevWeekStartDate,
            };
            router.visit(route("schedule.index", params));
        }
    };

    const handleNextClick = () => {
        const nextDate = endDate
            .add(SCHEDULE_DAYS_SKIP_NEXT, "day")
            .format("YYYY-MM-DD");
        const params = {
            ...(activeFilter ? { type: activeFilter } : {}),
            date: nextDate,
        };
        router.visit(route("schedule.index", params));
    };

    return (
        <Group>
            {showPrevButton && (
                <Button size="xs" p={2} bg="violet.9" onClick={handlePrevClick}>
                    <ChevronLeft />
                </Button>
            )}
            <Title order={1}>Schedule</Title>
            <Button size="xs" p={2} bg="violet.9" onClick={handleNextClick}>
                <ChevronRight />
            </Button>
        </Group>
    );
};

export default ScheduleNavigationAndTitle;
