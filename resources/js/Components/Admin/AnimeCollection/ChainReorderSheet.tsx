import { useState } from 'react';
import {
	Button,
	Drawer,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { InfoIcon, ListRestart, X } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { ChainData } from '@/Pages/Admin/ShowAnimeCollectionPage';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { router } from '@inertiajs/react';

type ChainReorderSheetProps = {
	chainEntries: Record<string, ChainData> | {};
	mapId?: number;
};

type OrderUpdate = {
	chainId: string;
	numOrder: number;
};

export function ChainReorderSheet({
	chainEntries,
	mapId,
}: ChainReorderSheetProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [orders, setOrders] = useState<Record<string, string>>(() => {
		const initialOrders: Record<string, string> = {};
		Object.entries(chainEntries).forEach(([chainId, chain]) => {
			initialOrders[chainId] = chain.importance_order.toString();
		});
		return initialOrders;
	});

	const handleOrderChange = (chainId: string, value: string) => {
		setOrders((prev) => ({
			...prev,
			[chainId]: value,
		}));
	};

	async function onUpdateOrder(updates: OrderUpdate[]) {
		try {
			const response = await axios.patch(
				route('admin.reorderChains', { animeMap: mapId }),
				{
					data: updates,
				}
			);

			notifications.show({
				title: 'Success',
				message: response.data.message,
				color: 'green',
				icon: <InfoIcon />,
			});

			if (response.data.refresh === true) {
				router.reload();
			}
		} catch (error: any) {
			console.log(error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'red',
				icon: <X />,
			});
		}
	}

	const handleSave = () => {
		const updates: OrderUpdate[] = Object.entries(orders)
			.map(([chainId, order]) => {
				const numOrder = parseInt(order);
				if (!isNaN(numOrder)) {
					return { chainId, numOrder };
				}
				return null;
			})
			.filter((update): update is OrderUpdate => update !== null);

		onUpdateOrder(updates);
		close();
	};

	return (
		<>
			<Button
				onClick={open}
				leftSection={<ListRestart size={20} />}
				variant='light'
			>
				Reorder Chains
			</Button>

			<Drawer
				opened={opened}
				onClose={close}
				title='Reorder Chains'
				position='right'
				size='md'
			>
				<Stack gap='md'>
					{Object.entries(chainEntries).map(([chainId, chain]) => (
						<Paper
							key={chainId}
							shadow='xs'
							p='md'
							withBorder
						>
							<Stack gap='xs'>
								<Group justify='space-between'>
									<Text fw={500}>{chain.name}</Text>
									<Text
										size='sm'
										c='dimmed'
									>
										Chain ID: {chainId}
									</Text>
								</Group>

								<TextInput
									label='Importance Order'
									type='number'
									value={orders[chainId]}
									onChange={(e) => handleOrderChange(chainId, e.target.value)}
									min={1}
								/>

								<Text
									size='sm'
									c='dimmed'
								>
									Entries: {chain.entries.length}
								</Text>
							</Stack>
						</Paper>
					))}

					<Button
						onClick={handleSave}
						mt='xl'
					>
						Save Changes
					</Button>
				</Stack>
			</Drawer>
		</>
	);
}
