import BoundedContainer from "@/Components/BoundedContainer";
import EmptySchedule from "@/Components/Schedule/EmptySchedule";
import ScheduleContent from "@/Components/Schedule/ScheduleContent";
import ScheduleHeader from "@/Components/Schedule/ScheduleHeader";
import ScheduleNavigationAndTitle from "@/Components/Schedule/ScheduleNavigationAndTitle";
import ScheduleSkeleton from "@/Components/Schedule/ScheduleSkeleton";
import { useScheduleFilterStore } from "@/Components/Schedule/store/useScheduleFilterStore";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { DailySchedule, TypeCounts } from "@/types/schedule";
import { Deferred, Head } from "@inertiajs/react";
import { Space, Stack } from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect } from "react";

dayjs.extend(relativeTime);

type ScheduleData = {
    schedule: DailySchedule[];
    counts: TypeCounts;
};

function Schedule({ data }: { data?: ScheduleData }) {
    const { initFromUrl } = useScheduleFilterStore();

    useEffect(() => {
        initFromUrl();
    }, []);

    return (
        <>
            <Head title="Schedule" />
            <Space h={80} />

            <BoundedContainer>
                <Stack gap={8}>
                    <Deferred data="data" fallback={<ScheduleSkeleton />}>
                        {data ? (
                            <>
                                <ScheduleNavigationAndTitle
                                    counts={data.counts}
                                />
                                <ScheduleHeader counts={data.counts} />
                                {data.schedule && data.schedule.length > 0 ? (
                                    <ScheduleContent schedule={data.schedule} />
                                ) : (
                                    <EmptySchedule />
                                )}
                            </>
                        ) : (
                            <EmptySchedule />
                        )}
                    </Deferred>
                </Stack>
            </BoundedContainer>
        </>
    );
}

Schedule.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Schedule;
