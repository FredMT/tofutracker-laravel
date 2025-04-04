import { useState } from 'react';
import { Button, Drawer, TextInput, Group, Stack } from '@mantine/core';
import { InfoIcon, Pencil, X } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface RenameChainButtonProps {
	mapId: number;
	chainId: string;
	initialName: string;
}

export function RenameChainButton({
	mapId,
	chainId,
	initialName,
}: RenameChainButtonProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [name, setName] = useState(initialName);
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = async () => {
		try {
			setIsLoading(true);

			const response = await axios.patch(
				route('admin.updateChainName', { chain: chainId }),
				{
					chain_name: name,
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

			close();
		} catch (error: any) {
			console.log(error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'red',
				icon: <X />,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Button
				variant='subtle'
				size='sm'
				leftSection={<Pencil size={16} />}
				onClick={open}
				pt={0}
			>
				Rename
			</Button>

			<Drawer
				opened={opened}
				onClose={close}
				title='Rename Chain'
				position='right'
				padding='lg'
			>
				<Stack gap='md'>
					<TextInput
						label='Chain Name'
						value={name}
						onChange={(event) => setName(event.currentTarget.value)}
						placeholder='Enter chain name'
						data-autofocus
					/>

					<Group
						justify='flex-end'
						gap='sm'
					>
						<Button
							variant='light'
							onClick={close}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							loading={isLoading}
							disabled={name.length < 1}
						>
							Save
						</Button>
					</Group>
				</Stack>
			</Drawer>
		</>
	);
}
