import MediaCard, { MediaItemProps } from '@/Components/Common/MediaCard';
import { Credit } from '@/Components/Person/PersonUtils';
import { usePersonContext } from '@/Components/Person/store/personStore';
import {
	usePersonWatchedStats,
	isMediaWatched,
} from '@/propsHooks/usePersonWatchedStats';
import { Box, Text, Title, Tooltip } from '@mantine/core';

interface PersonKnownForProps {
	getMediaItem: (credit: any) => MediaItemProps;
	getTvMediaItem: (credit: any) => MediaItemProps;
	getAnimeMediaItem: (credit: any) => MediaItemProps;
}

export default function PersonKnownFor({
	getMediaItem,
	getTvMediaItem,
	getAnimeMediaItem,
}: PersonKnownForProps) {
	const knownFor = usePersonContext((state) => state.knownFor);
	const watchedStats = usePersonWatchedStats();

	return (
		<Box>
			<Title
				order={4}
				mb='md'
			>
				Known For
			</Title>
			<Box className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
				{knownFor.map((credit, index) => {
					const mediaType = credit.mediaType;
					const isWatched = isMediaWatched(mediaType, credit.id, watchedStats);

					let mediaItem;
					if (mediaType === 'tv') {
						mediaItem = getTvMediaItem(credit);
					} else if (mediaType === 'anime') {
						mediaItem = getAnimeMediaItem(credit);
					} else {
						mediaItem = getMediaItem(credit);
					}

					const uniqueKey =
						mediaType === 'anime' && credit.original_id
							? `known-for-${credit.id}-${mediaType}-${credit.original_id}`
							: `known-for-${credit.id}-${mediaType}-${index}`;

					return (
						<Box
							key={uniqueKey}
							className='flex flex-col'
						>
							<MediaCard
								media={mediaItem}
								isWatched={isWatched}
							/>
							<Tooltip label={credit.character}>
								<Text
									size='xs'
									c='dimmed'
									mt={8}
									ta='center'
									lineClamp={1}
								>
									{credit.character}
								</Text>
							</Tooltip>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
