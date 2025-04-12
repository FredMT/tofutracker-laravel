import { Carousel } from '@mantine/carousel';
import {
	AspectRatio,
	Box,
	Container,
	Modal,
	Overlay,
	Paper,
	Space,
	Text,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import carouselClasses from './Carousel.module.css';

dayjs.extend(relativeTime);

interface Trailer {
	id: number;
	videoId: string;
	showName: string;
	videoTitle: string;
	showId: number;
	publishedAt: number;
}

const mockTrailers: Trailer[] = [
	{
		id: 1,
		videoId: 'dQw4w9WgXcQ',
		showName: 'Stranger Things Season 5',
		videoTitle: 'Official Teaser',
		showId: 101,
		publishedAt: 1704067200,
	},
	{
		id: 2,
		videoId: 'yPYZpwSpKmA',
		showName: 'The Witcher Season 4 First Look',
		videoTitle: 'Geralt Returns',
		showId: 102,
		publishedAt: 1706745600,
	},
	{
		id: 3,
		videoId: 'L3oOldViIgY',
		showName: 'Squid Game The Challenge',
		videoTitle: 'Reality Show Trailer',
		showId: 103,
		publishedAt: 1709251200,
	},
	{
		id: 4,
		videoId: 'aWzlQ2N6qqg',
		showName: 'Avatar: The Last Airbender Live Action',
		videoTitle: 'Full Trailer',
		showId: 104,
		publishedAt: 1701388800,
	},
	{
		id: 5,
		videoId: 'UaVTIH8mujA',
		showName: 'One Piece Live Action Season 2 Teaser',
		videoTitle: 'First Look',
		showId: 105,
		publishedAt: 1711929600,
	},
	{
		id: 6,
		videoId: 'G_AEL-Xo5l8',
		showName: 'The Crown Season 6 Part 2',
		videoTitle: 'The Final Season',
		showId: 106,
		publishedAt: 1698796800,
	},
];

function formatRelativeTime(timestamp: number): string {
	return dayjs.unix(timestamp).fromNow();
}

const TrailerSection = () => {
	const carouselRef = useRef(null);
	const videoWidth = 300;
	const videoHeight = Math.round(videoWidth * (9 / 16));
	const textHeightEstimate = 60;

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
					{mockTrailers.map((trailer, index) => (
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
											className='text-white mb-1 truncate'
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

export default TrailerSection;
