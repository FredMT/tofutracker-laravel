import { Button, Group } from '@mantine/core';
import { Heart, Share2 } from 'lucide-react';

export default function PersonActions() {
	return (
		<Group
			gap='xs'
			className='justify-center md:justify-start mb-8'
		>
			<Button
				variant='light'
				color='grape'
				radius='xl'
			>
				<Heart className='w-3.5 h-3.5 mr-2' /> Favorite
			</Button>
			<Button
				variant='light'
				color='gray'
				radius='xl'
			>
				<Share2 className='w-3.5 h-3.5 mr-2' /> Share
			</Button>
		</Group>
	);
}
