import { ScheduleItem } from "@/types/schedule";
import dayjs from "dayjs";

export const removeDuplicates = (schedules: ScheduleItem[]): ScheduleItem[] => {
    const seen = new Set<string>();
    return schedules.filter((item) => {
        const key = `${item.show_id}-${item.episode_date}`;
        return !seen.has(key) && !!seen.add(key);
    });
};

export const removePastEpisodes = (
    schedules: ScheduleItem[]
): ScheduleItem[] => {
    const currentDateTime = dayjs();
    return schedules.filter((item) =>
        dayjs(item.episode_date).isAfter(currentDateTime)
    );
};

export const processSchedules = (schedules: ScheduleItem[]): ScheduleItem[] => {
    return removePastEpisodes(removeDuplicates(schedules));
};
