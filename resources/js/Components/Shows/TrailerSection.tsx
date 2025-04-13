import { Carousel } from '@mantine/carousel';
import {
	AspectRatio,
	Box,
	Container,
	Modal,
	Overlay,
	Paper,
	Skeleton,
	Space,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import React, { useRef, useState } from 'react';
import carouselClasses from './Carousel.module.css';
import { Deferred } from '@inertiajs/react';
import { useShowsPageTrailers } from '@/propsHooks/useShowsPageTrailers';

interface Trailer {
	id: string | number;
	videoId: string;
	showName: string;
	videoTitle: string;
	showId: number | null;
	publishedAt: number;
}

const TrailerSkeleton = () => {
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

interface TrailerListProps {
	trailers: Trailer[];
}

const TrailerList: React.FC<TrailerListProps> = ({ trailers }) => {
	const carouselRef = useRef(null);
	const videoWidth = 300;
	const videoHeight = Math.round(videoWidth * (9 / 16));
	const textHeightEstimate = 80;
	const [opened, { open, close }] = useDisclosure(false);
	const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);

	const handleOpenModal = (trailer: Trailer) => {
		setSelectedTrailer(trailer);
		open();
	};

	const handleCloseModal = () => {
		close();
		setSelectedTrailer(null);
	};

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<div className='py-8'>
				<Title>Latest Trailers</Title>
				<Space h='xl' />
				{trailers && trailers.length > 0 ? (
					<Carousel
						height={videoHeight + textHeightEstimate}
						ref={carouselRef}
						slideSize={videoWidth}
						slideGap={{ base: 'md', sm: 'xl' }}
						align='start'
						loop={false}
						slidesToScroll={1}
						withControls={true}
						controlsOffset={0}
						classNames={{
							control: carouselClasses.carouselControl,
							controls: carouselClasses.carouselControls,
						}}
						previousControlIcon={<ChevronLeft size={40} />}
						nextControlIcon={<ChevronRight size={40} />}
						className='w-full'
					>
						{trailers.map((trailer, index) => (
							<Carousel.Slide key={trailer.id}>
								<motion.div
									className='h-full'
									initial='hidden'
									whileInView='visible'
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									variants={{
										visible: { opacity: 1, scale: 1, y: 0 },
										hidden: { opacity: 0, scale: 0.95, y: 30 },
									}}
								>
									<Paper
										shadow='md'
										radius='md'
										className='overflow-hidden relative group bg-dark-7'
										style={{ width: `${videoWidth}px` }}
									>
										<Box
											className='relative cursor-pointer'
											onClick={() => handleOpenModal(trailer)}
										>
											<AspectRatio
												ratio={16 / 9}
												className='relative'
											>
												<img
													src={`https://img.youtube.com/vi/${trailer.videoId}/hqdefault.jpg`}
													alt={`${trailer.showName} trailer thumbnail`}
													className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
												/>
												<Overlay
													gradient='linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 100%)'
													opacity={0}
													className='transition-opacity duration-300 group-hover:opacity-100'
												/>
												<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
													<div className='bg-black/50 rounded-full p-3 backdrop-blur-sm'>
														<Play
															size={32}
															className='text-white fill-white'
														/>
													</div>
												</div>
											</AspectRatio>
										</Box>

										<div className='p-3 text-center'>
											<Title
												order={5}
												className='mb-1 truncate'
												lineClamp={1}
											>
												{trailer.showName}
											</Title>
											<Text
												size='sm'
												className='text-gray-400 truncate'
												fw={500}
											>
												{trailer.videoTitle}
											</Text>
										</div>
									</Paper>
								</motion.div>
							</Carousel.Slide>
						))}
					</Carousel>
				) : (
					<Text>No trailers available at the moment.</Text>
				)}
			</div>

			{selectedTrailer && (
				<Modal
					opened={opened}
					onClose={handleCloseModal}
					title={`${selectedTrailer.showName} - ${selectedTrailer.videoTitle}`}
					size={'70%'}
					centered
					styles={{
						body: { background: 'none' },
					}}
				>
					<AspectRatio ratio={16 / 9}>
						<iframe
							src={`https://www.youtube.com/embed/${selectedTrailer.videoId}?autoplay=1`}
							title={`${selectedTrailer.showName} - ${selectedTrailer.videoTitle}`}
							style={{ border: 0 }}
							allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
							allowFullScreen
						/>
					</AspectRatio>
				</Modal>
			)}
		</Container>
	);
};

const TrailerSection = () => {
	const trailers = useShowsPageTrailers();
	return (
		<Deferred
			data='trailers'
			fallback={<TrailerSkeleton />}
		>
			<TrailerList trailers={trailers} />
		</Deferred>
	);
};

export default TrailerSection;
