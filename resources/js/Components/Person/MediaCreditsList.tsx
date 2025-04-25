import MediaCredit from '@/Components/Person/MediaCredit';
import {
	usePersonWatchedStats,
	isMediaWatched,
} from '@/propsHooks/usePersonWatchedStats';
import { Badge, Box, Divider, Group, Text, Title } from '@mantine/core';

interface MediaCreditsListProps {
	title: string;
	credits: any[];
	getMediaItemFunction: (credit: any) => any;
	roleKey: string;
	mediaType: 'movie' | 'tv' | 'anime';
}

export default function MediaCreditsList({
	title,
	credits,
	getMediaItemFunction,
	roleKey,
	mediaType,
}: MediaCreditsListProps) {
	if (credits.length === 0) return null;

	const watchedStats = usePersonWatchedStats();

	return (
		<>
			<Group
				justify='apart'
				mb='md'
			>
				<Title order={4}>{title}</Title>
				<Badge
					variant='filled'
					color='blue'
					size='lg'
				>
					{credits.length}
				</Badge>
			</Group>

			<Divider mb='lg' />

			<Box className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10'>
				{credits.map((credit, index) => {
					const isWatched = isMediaWatched(mediaType, credit.id, watchedStats);

					const uniqueKey =
						mediaType === 'anime' && credit.original_id
							? `${mediaType}-${credit.id}-${credit.original_id}`
							: `${mediaType}-${credit.id}-${index}`;

					return (
						<MediaCredit
							key={uniqueKey}
							id={credit.id}
							media={credit}
							role={credit[roleKey]}
							getMediaItemFunction={getMediaItemFunction}
							isWatched={isWatched}
						/>
					);
				})}
			</Box>
		</>
	);
}
