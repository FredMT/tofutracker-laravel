import MediaCard from '@/Components/Common/MediaCard';
import { Box, Text, Tooltip } from '@mantine/core';

interface MediaCreditProps {
	id: number;
	media: any;
	role: string;
	getMediaItemFunction: (credit: any) => any;
	isWatched?: boolean;
}

export default function MediaCredit({
	id,
	media,
	role,
	getMediaItemFunction,
	isWatched = false,
}: MediaCreditProps) {
	return (
		<Box
			key={id}
			className='flex flex-col'
		>
			<MediaCard
				media={getMediaItemFunction(media)}
				isWatched={isWatched}
			/>
			<Tooltip label={role}>
				<Text
					size='xs'
					c='dimmed'
					mt={8}
					ta='center'
					lineClamp={1}
				>
					{role}
				</Text>
			</Tooltip>
		</Box>
	);
}
