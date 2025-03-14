import { Skeleton, Stack } from "@mantine/core";
import ScheduleTypeFilterBadges from "./ScheduleTypeFilterBadges";

export default function ScheduleSkeleton() {
    return (
        <Stack gap={16}>
            <Stack gap={16}>
                <Skeleton height="81px" radius="md" />
                <ScheduleTypeFilterBadges />
                {Array(3)
                    .fill(0)
                    .map((_, index) => (
                        <Stack key={index} gap={8}>
                            <Skeleton height={40} radius="md" />
                            <Skeleton height={200} radius="md" />
                        </Stack>
                    ))}
            </Stack>
        </Stack>
    );
}
