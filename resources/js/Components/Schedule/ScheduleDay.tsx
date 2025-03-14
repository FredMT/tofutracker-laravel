import {DailySchedule} from "@/types/schedule";
import {Accordion, Flex, Group, Space, Text} from "@mantine/core";
import ScheduleItem from "@/Components/Schedule/ScheduleItem";

interface ScheduleDayProps {
    day: DailySchedule;
}

export default function ScheduleDay({ day }: ScheduleDayProps) {
    return (
        <Accordion.Item key={day.formatted_date} value={day.formatted_date}>
            <Accordion.Control>
                <Group>
                    <Text
                        fw={600}
                    >{`${day.day_of_week} ${day.formatted_date}`}</Text>
                </Group>
            </Accordion.Control>
            <Space h={8} />
            <Accordion.Panel>
                <Flex gap="md" wrap="wrap">
                    {day.schedules.map((item) => (
                        <ScheduleItem
                            key={`${item.show_id}-${item.episode_date}`}
                            item={item}
                        />
                    ))}
                </Flex>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
