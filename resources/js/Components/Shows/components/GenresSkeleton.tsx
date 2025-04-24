import { Box, Container, Skeleton } from '@mantine/core';
import { Carousel } from '@mantine/carousel';

export const GenresSkeleton = () => {
	const showCardWidth = 200;
	const showCardHeight = showCardWidth * (3 / 2);
	const buttonHeight = 38;
	const mainImageHeight = 500;
	const carouselHeight = 300;

	return (
		<div className='space-y-4'>
			<Skeleton
				height={30}
				width={200}
				mb='md'
			/>

			<div className='overflow-hidden'>
				<div className='overflow-x-auto pb-2 hide-scrollbar'>
					<div className='flex gap-2 min-w-max'>
						{Array.from({ length: 8 }).map((_, index) => (
							<Skeleton
								key={index}
								height={buttonHeight}
								width={100}
								radius='xl'
							/>
						))}
					</div>
				</div>
			</div>

			<div className='mb-8 w-full'>
				<Box
					className='relative rounded-xl overflow-hidden'
					style={{ height: `${mainImageHeight}px` }}
				>
					<Skeleton
						width='100%'
						height='100%'
					/>
					<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent' />
					<div className='absolute top-0 left-0 right-0 p-6 space-y-4'>
						<Skeleton
							height={36}
							width={250}
							mb='sm'
						/>
						<Skeleton
							height={18}
							width='60%'
						/>
						<Skeleton
							height={18}
							width='50%'
							mb='xl'
						/>

						<Container
							size='100%'
							px={60}
							mx={0}
						>
							<Carousel
								height={carouselHeight}
								slideSize={showCardWidth}
								align='start'
								slideGap='md'
								slidesToScroll={1}
								withControls={false}
								className='w-full pointer-events-none'
							>
								{Array.from({ length: 5 }).map((_, index) => (
									<Carousel.Slide key={index}>
										<Skeleton
											height={showCardHeight}
											width={showCardWidth}
											radius='md'
										/>
									</Carousel.Slide>
								))}
							</Carousel>
						</Container>
					</div>
				</Box>
			</div>
		</div>
	);
};
