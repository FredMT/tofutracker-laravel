import { Recommended } from '@/types';
import { Carousel } from '@mantine/carousel';
import { Divider, Stack, Title } from '@mantine/core';
import RecommendedContentCard from './RecommendedContentCard';
import CustomCarousel from '@/Components/Shared/CustomCarousel';
import { useRegularContentData } from '@/propsHooks/useRegularContentData';

interface RecommendedContentProps {
	containerWidth: number;
	slideSize?: string;
}

export default function RecommendedContent({
	containerWidth,
	slideSize = '0%',
}: RecommendedContentProps) {
	const data = useRegularContentData();

	if (!data.recommended || data.recommended.length < 1) return null;

	return (
		<Stack>
			<Divider my={16} />
			<Title order={3}>Recommended</Title>
			<CustomCarousel
				containerWidth={containerWidth}
				slideSize={slideSize}
				height={300}
				slidesToScroll={3}
			>
				{data.recommended.map((recommended: Recommended) => (
					<Carousel.Slide key={recommended.id}>
						<RecommendedContentCard content={recommended} />
					</Carousel.Slide>
				))}
			</CustomCarousel>
			<Divider my={16} />
		</Stack>
	);
}
