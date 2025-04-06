import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { ExternalLink, Lightbulb, Lock, Pencil } from "lucide-react";
import { router } from "@inertiajs/react";
import { usePermissions } from "@/propsHooks/usePermissions";

interface ActionButtonsProps {
	visitUrl: string;
	itemId: number;
	itemType: "collection" | "entry" | "related";
}

export function ActionButtons({
																visitUrl,
																itemId,
																itemType,
															}: ActionButtonsProps) {
	const permissions = usePermissions();
	const isSuperuser = permissions?.is_superuser || false;

	const handleVisit = () => {
		router.visit(visitUrl);
	};

	const handleSuggestions = () => {
		console.log(`Suggestions for ${itemType} ${itemId}`);
	};

	const handleLock = () => {
		console.log(`Lock ${itemType} ${itemId}`);
	};

	const handleEdit = () => {
		console.log(`Edit ${itemType} ${itemId}`);
	};

	return (
		<Group gap="xs">
			<Tooltip label="Visit">
				<ActionIcon
					variant="subtle"
					color="blue"
					onClick={handleVisit}
					aria-label="Visit"
				>
					<ExternalLink size={16} />
				</ActionIcon>
			</Tooltip>

			<Tooltip label="Suggestions">
				<ActionIcon
					variant="subtle"
					color="yellow"
					onClick={handleSuggestions}
					aria-label="Suggestions"
				>
					<Lightbulb size={16} />
				</ActionIcon>
			</Tooltip>

			{isSuperuser && (
				<>
					<Tooltip label="Lock">
						<ActionIcon
							variant="subtle"
							color="gray"
							onClick={handleLock}
							aria-label="Lock"
						>
							<Lock size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Edit">
						<ActionIcon
							variant="subtle"
							color="green"
							onClick={handleEdit}
							aria-label="Edit"
						>
							<Pencil size={16} />
						</ActionIcon>
					</Tooltip>
				</>
			)}
		</Group>
	);
}
