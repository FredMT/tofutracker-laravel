import { Carousel } from '@mantine/carousel';
import {
	AspectRatio,
	Box,
	Container,
	Modal,
	Overlay,
	Paper,
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
import { Link } from '@inertiajs/react';

interface Trailer {
	id: number;
	title: string;
	video_key: string;
	video_name: string;
}

// Renders a carousel of anime trailers with modal playback
const TrailerList: React.FC<{ trailers: Trailer[] }> = ({ trailers }) => {
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
			<div className='pb-8'>
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
						slidesToScroll='auto'
						inViewThreshold={0.9}
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
									transition={{ duration: 0.5, delay: index * 0.05 }}
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
													src={`https://img.youtube.com/vi/${trailer.video_key}/hqdefault.jpg`}
													alt={`${trailer.title} trailer thumbnail`}
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
											<Link
												href={`/anime/${trailer.id}`}
												prefetch
											>
												<Title
													order={5}
													className='mb-1 truncate'
													lineClamp={1}
												>
													{trailer.title}
												</Title>
											</Link>
											<Text
												size='sm'
												className='text-gray-400 truncate'
												fw={500}
											>
												{trailer.video_name}
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
					title={`${selectedTrailer.title} - ${selectedTrailer.video_name}`}
					size={'70%'}
					centered
					styles={{ body: { background: 'none' } }}
				>
					<AspectRatio ratio={16 / 9}>
						<iframe
							src={`https://www.youtube.com/embed/${selectedTrailer.video_key}?autoplay=1`}
							title={`${selectedTrailer.title} - ${selectedTrailer.video_name}`}
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

export default TrailerList;
