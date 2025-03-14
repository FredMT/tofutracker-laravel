import {CombinedSchedules} from "@/types/schedule";
import {Accordion} from "@mantine/core";
import ScheduleDay from "@/Components/Schedule/ScheduleDay";
import {processSchedules} from "@/Components/Schedule/utils/scheduleUtils";
import EmptySchedule from "@/Components/Schedule/EmptySchedule";

interface ScheduleContentProps {
    schedule: CombinedSchedules;
}

export default function ScheduleContent({ schedule }: ScheduleContentProps) {
    const validDays = schedule
        .map((day) => {
            const filteredSchedules = processSchedules(day.schedules);
            return filteredSchedules.length > 0 ? day.formatted_date : null;
        })
        .filter((date): date is string => date !== null);

    if (validDays.length === 0) {
        return <EmptySchedule />;
    }

    return (
        <Accordion defaultValue={validDays} multiple>
            {schedule
                .map((day) => {
                    const filteredSchedules = processSchedules(day.schedules);

                    if (filteredSchedules.length === 0) {
                        return null;
                    }

                    return (
                        <ScheduleDay
                            key={day.formatted_date}
                            day={{
                                ...day,
                                schedules: filteredSchedules,
                            }}
                        />
                    );
                })
                .filter(Boolean)}
        </Accordion>
    );
}
