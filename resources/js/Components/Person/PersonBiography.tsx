import { usePersonContext } from '@/Components/Person/store/personStore';
import { Box, Text, Title } from '@mantine/core';

export default function PersonBiography() {
	const biography = usePersonContext((state) => state.person.biography);

	return (
		<Box>
			<Title
				order={4}
				mb='md'
			>
				Biography
			</Title>
			<Text
				size='sm'
				className='text-pretty'
			>
				{biography || 'No biography available.'}
			</Text>
		</Box>
	);
}
