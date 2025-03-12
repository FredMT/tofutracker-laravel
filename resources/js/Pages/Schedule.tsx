import BoundedContainer from "@/Components/BoundedContainer";
import ScheduleDay from "@/Components/Schedule/ScheduleDay";
import ScheduleCountSummary from "@/Components/Schedule/ScheduleItem/ScheduleCountSummary";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { CombinedSchedules, ScheduleItem, TypeCounts } from "@/types/schedule";
import { Head } from "@inertiajs/react";
import { Accordion, Badge, Group, Space, Stack, Title } from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function removeDuplicateSchedules(schedules: ScheduleItem[]): ScheduleItem[] {
    const seen = new Set<string>();
    return schedules.filter((item) => {
        const key = `${item.show_id}-${item.episode_date}`;
        return !seen.has(key) && !!seen.add(key);
    });
}

function removePastEpisodes(schedules: ScheduleItem[]): ScheduleItem[] {
    const currentDateTime = dayjs();

    return schedules.filter((item) => {
        const episodeDateTime = dayjs(item.episode_date);
        return episodeDateTime.isAfter(currentDateTime);
    });
}

function Schedule({
    schedule,
    counts,
}: {
    schedule: CombinedSchedules;
    counts: TypeCounts;
}) {
    // Create a new schedule array with duplicates removed
    const filteredSchedule = schedule.map((day) => ({
        ...day,
        schedules: removePastEpisodes(removeDuplicateSchedules(day.schedules)),
    }));

    return (
        <>
            <Head title="Schedule" />
            <Space h={72} />

            <BoundedContainer>
                <Stack gap={8}>
                    <Title order={1}>Schedule</Title>

                    <ScheduleCountSummary counts={counts} />
                    <Space h={4} />

                    <Group>
                        <Badge variant="outline" size="lg">
                            TV Shows
                        </Badge>
                        <Badge variant="outline" size="lg">
                            Anime
                        </Badge>
                    </Group>

                    <Accordion
                        defaultValue={filteredSchedule.map(
                            (day) => day.formatted_date
                        )}
                        multiple
                    >
                        {filteredSchedule.map((day) => (
                            <ScheduleDay key={day.formatted_date} day={day} />
                        ))}
                    </Accordion>
                </Stack>
            </BoundedContainer>
        </>
    );
}

Schedule.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Schedule;
