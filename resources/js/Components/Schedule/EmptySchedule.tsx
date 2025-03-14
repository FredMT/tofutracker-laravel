import { Center, Text } from "@mantine/core";

export default function EmptySchedule() {
    return (
        <Center py={40}>
            <Text c="dimmed" size="lg">
                No schedule data available
            </Text>
        </Center>
    );
}
