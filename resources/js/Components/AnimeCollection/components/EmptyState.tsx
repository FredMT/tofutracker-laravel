import { Box, Center, Text } from "@mantine/core";
import { Database } from "lucide-react";

/**
 * Component to display when no collections are found
 */
export function EmptyState() {
    return (
        <Center p="xl" style={{ height: 200 }}>
            <Box ta="center">
                <Database size={40} color="gray" />
                <Text fz="lg" fw={500} mt="md" color="dimmed">
                    No anime collections found
                </Text>
                <Text fz="sm" color="dimmed" mt="xs">
                    Try adjusting your search criteria or check back later.
                </Text>
            </Box>
        </Center>
    );
}
