import {
	usePersonAge,
	usePersonContext,
} from '@/Components/Person/store/personStore';
import { ActionIcon, Badge, Button, Group, Stack, Title } from '@mantine/core';
import { Instagram, Twitter } from 'lucide-react';

export default function PersonProfile() {
	const profileData = usePersonContext((state) => ({
		person: state.person,
		external_ids: state.external_ids,
	}));

	const age = usePersonAge();

	return (
		<Stack
			gap='xs'
			mt='xl'
		>
			<Title className='text-3xl md:text-4xl'>{profileData.person.name}</Title>

			<Group
				gap='xs'
				className='justify-center md:justify-start'
			>
				<Badge
					variant='filled'
					color='dark'
					size='lg'
					className='border border-gray-700'
				>
					{profileData.person.known_for_department}
				</Badge>
				<Badge
					variant='filled'
					color='dark'
					size='lg'
					className='border border-gray-700'
				>
					{age} years
				</Badge>
			</Group>

			<Group className='justify-center md:justify-start mt-2'>
				{profileData.external_ids.imdb_id && (
					<Button
						variant='outline'
						color='yellow'
						size='xs'
						component='a'
						href={`https://www.imdb.com/name/${profileData.external_ids.imdb_id}`}
						target='_blank'
						radius='xl'
					>
						IMDb
					</Button>
				)}
				{profileData.external_ids.instagram_id && (
					<ActionIcon
						variant='outline'
						color='violet'
						size='lg'
						component='a'
						href={`https://www.instagram.com/${profileData.external_ids.instagram_id}`}
						target='_blank'
						radius='xl'
					>
						<Instagram size={18} />
					</ActionIcon>
				)}
				{profileData.external_ids.twitter_id && (
					<ActionIcon
						variant='outline'
						color='blue'
						size='lg'
						component='a'
						href={`https://twitter.com/${profileData.external_ids.twitter_id}`}
						target='_blank'
						radius='xl'
					>
						<Twitter size={18} />
					</ActionIcon>
				)}
			</Group>
		</Stack>
	);
}
