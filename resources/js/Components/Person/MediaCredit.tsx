import MediaCard from '@/Components/Common/MediaCard';
import { Box, Text, Tooltip } from '@mantine/core';

interface MediaCreditProps {
	id: number;
	media: any;
	role: string;
	getMediaItemFunction: (credit: any) => any;
}

export default function MediaCredit({
	id,
	media,
	role,
	getMediaItemFunction,
}: MediaCreditProps) {
	return (
		<Box
			key={id}
			className='flex flex-col'
		>
			<MediaCard media={getMediaItemFunction(media)} />
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
