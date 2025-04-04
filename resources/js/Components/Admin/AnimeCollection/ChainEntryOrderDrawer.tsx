import { ChainEntry } from '@/Pages/Admin/ShowAnimeCollectionPage';
import {
	Button,
	Drawer,
	Group,
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { notifications } from '@mantine/notifications';
import { Check, InfoIcon, X } from 'lucide-react';

interface ChainEntryOrderDrawerProps {
	opened: boolean;
	close: () => void;
	entries: ChainEntry[];
	chainName: string;
}

type EditableChainEntry = ChainEntry & { sequence_order_input: string };

export function ChainEntryOrderDrawer({
	opened,
	close,
	entries,
	chainName,
}: ChainEntryOrderDrawerProps) {
	const [editableEntries, setEditableEntries] = useState<EditableChainEntry[]>(
		[]
	);

	useEffect(() => {
		if (opened && entries) {
			const sortedAndEnhanced = [...entries]
				.sort((a, b) => a.sequence_order - b.sequence_order)
				.map((entry) => ({
					...entry,
					sequence_order_input: String(entry.sequence_order),
				}));
			setEditableEntries(sortedAndEnhanced);
		} else {
			setEditableEntries([]);
		}
	}, [entries, opened]);

	const handleInputChange = (id: number, value: string) => {
		setEditableEntries((currentEntries) =>
			currentEntries.map((entry) =>
				entry.id === id ? { ...entry, sequence_order_input: value } : entry
			)
		);
	};

	const handleSave = async () => {
		const updatedEntries = editableEntries.map((entry) => ({
			...entry,
			sequence_order: parseInt(entry.sequence_order_input, 10) || 0,
		}));

		const dataToSend = updatedEntries.map((entry) => ({
			id: entry.id,
			anime_id: entry.anime_id,
			chain_id: entry.chain_id,
			sequence_order: entry.sequence_order,
		}));

		try {
			const response = await axios.patch(route('admin.reorderChainEntries'), {
				data: dataToSend,
			});

			notifications.show({
				title: 'Success',
				message: response.data.message,
				color: 'green',
				icon: <Check size={18} />,
			});

			if (response.data.refresh) {
				router.reload({ only: ['data'] });
			}
			close();
		} catch (error: any) {
			console.error('Error updating chain entry order:', error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'red',
				icon: <X size={18} />,
			});
		}
	};

	return (
		<Drawer
			opened={opened}
			onClose={close}
			title={<Title order={4}>Edit Order for Chain: "{chainName}"</Title>}
			position='right'
			padding='md'
			size='40rem'
			overlayProps={{
				backgroundOpacity: 0.5,
				blur: 4,
			}}
		>
			<Stack>
				<Text
					size='sm'
					c='dimmed'
				>
					Edit the sequence order for each entry below.
				</Text>
				{/* Map over the editable state */}
				<Stack gap='md'>
					{editableEntries.map((entry) => (
						<Group
							key={entry.id}
							justify='space-between'
							wrap='nowrap'
						>
							<Text
								maw='70%'
								truncate='end'
							>
								Anime ID: {entry.anime_id} - {entry.title_main}
							</Text>
							<TextInput
								type='number'
								w={100}
								label='Order'
								value={entry.sequence_order_input}
								onChange={(event) =>
									handleInputChange(entry.id, event.currentTarget.value)
								}
							/>
						</Group>
					))}
				</Stack>
				<Button
					onClick={handleSave}
					mt='lg'
				>
					Save Order
				</Button>
			</Stack>
		</Drawer>
	);
}
