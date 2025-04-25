import MediaCard, { MediaItemProps } from '@/Components/Common/MediaCard';
import { Credit } from '@/Components/Person/PersonUtils';
import { usePersonContext } from '@/Components/Person/store/personStore';
import { Box, Text, Title, Tooltip } from '@mantine/core';

interface PersonKnownForProps {
	getMediaItem: (credit: any) => MediaItemProps;
	getTvMediaItem: (credit: any) => MediaItemProps;
}

export default function PersonKnownFor({
	getMediaItem,
	getTvMediaItem,
}: PersonKnownForProps) {
	const knownFor = usePersonContext((state) => state.knownFor);

	return (
		<Box>
			<Title
				order={4}
				mb='md'
			>
				Known For
			</Title>
			<Box className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
				{knownFor.map((credit) => (
					<Box
						key={`known-for-${credit.id}-${credit.mediaType}`}
						className='flex flex-col'
					>
						<MediaCard
							media={
								credit.mediaType === 'tv'
									? getTvMediaItem(credit)
									: getMediaItem(credit)
							}
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
				))}
			</Box>
		</Box>
	);
}
