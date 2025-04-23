import { Stack } from '@mantine/core';

import { Carousel } from '@mantine/carousel';

import { Skeleton } from '@mantine/core';

import { Container } from '@mantine/core';

export const TrailerSkeleton = () => {
	const videoWidth = 300;
	const videoHeight = Math.round(videoWidth * (9 / 16));
	const textHeightEstimate = 60;

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<div className='py-8'>
				<Skeleton
					height={30}
					width={200}
					mb='xl'
				/>
				<Carousel
					height={videoHeight + textHeightEstimate}
					slideSize={videoWidth}
					slideGap={{ base: 'md', sm: 'xl' }}
					align='start'
					withControls={false}
					className='w-full pointer-events-none'
				>
					{Array.from({ length: 5 }).map((_, index) => (
						<Carousel.Slide key={index}>
							<Stack gap='sm'>
								<Skeleton
									height={videoHeight}
									width={videoWidth}
									radius='md'
								/>
								<Skeleton
									height={15}
									width={videoWidth * 0.8}
									radius='sm'
								/>
								<Skeleton
									height={12}
									width={videoWidth * 0.6}
									radius='sm'
								/>
							</Stack>
						</Carousel.Slide>
					))}
				</Carousel>
			</div>
		</Container>
	);
};
