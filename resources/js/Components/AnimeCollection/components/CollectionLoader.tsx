import { Center, Loader, Text, Stack } from "@mantine/core";

/**
 * Component to display a loading indicator while fetching collections
 */
export function CollectionLoader() {
    return (
        <Center style={{ height: 300 }}>
            <Stack align="center" gap="xs">
                <Loader size="md" />
                <Text c="dimmed" size="sm">
                    Loading anime collections...
                </Text>
            </Stack>
        </Center>
    );
}
