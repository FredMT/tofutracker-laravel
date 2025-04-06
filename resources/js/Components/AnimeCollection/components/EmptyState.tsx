import { Box, Center, Text } from "@mantine/core";
import { Database } from "lucide-react";

export function EmptyState() {
	return (
		<Center p="xl" style={{ height: 200 }}>
			<Box ta="center">
				<Database size={40} color="gray" />
				<Text fz="lg" fw={500} mt="md" c="dimmed">
					No anime collections found
				</Text>
				<Text fz="sm" c="dimmed" mt="xs">
					Try adjusting your search criteria or check back later.
				</Text>
			</Box>
		</Center>
	);
}
