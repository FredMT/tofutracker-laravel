import {
	useShowsAiringScheduleCarousel,
	ScheduleItem,
} from '@/propsHooks/useAnimesAiringSchedule';
import AiringAnimeScheduleItem from './AiringAnimeScheduleItem';
import { Deferred } from '@inertiajs/react';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Container, Skeleton, Space, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import carouselClasses from './Carousel.module.css';

const AiringAnimeScheduleCarouselSkeleton = () => {
	const itemWidth = 238;
	const itemHeight = 229;
	const slideGap = 20;

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<Skeleton
				height={30}
				width={250}
				mb='xl'
			/>
			<Carousel
				height={itemHeight}
				align='start'
				slideSize={itemWidth}
				slideGap={slideGap}
				withControls={false}
				className='w-full pointer-events-none'
			>
				{Array.from({ length: 5 }).map((_, index) => (
					<Carousel.Slide key={index}>
						<Skeleton
							height={itemHeight}
							width={itemWidth}
							radius='md'
						/>
					</Carousel.Slide>
				))}
			</Carousel>
		</Container>
	);
};

interface AiringAnimeScheduleListProps {
	items: ScheduleItem[];
}

const AiringAnimeScheduleList = ({ items }: AiringAnimeScheduleListProps) => {
	const itemWidth = 238;
	const itemHeight = 229;
	const slideGap = 20;

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<Title>Upcoming Anime Episodes</Title>
			<Space h='xl' />
			<Carousel
				height={itemHeight}
				align='start'
				loop={false}
				slideSize={itemWidth}
				slidesToScroll='auto'
				slideGap={slideGap}
				withControls={items.length > 4}
				controlsOffset={0}
				classNames={{
					control: carouselClasses.carouselControl,
					controls: carouselClasses.carouselControls,
				}}
				previousControlIcon={<ChevronLeft size={40} />}
				nextControlIcon={<ChevronRight size={40} />}
				className='w-full'
			>
				{items.map((item, index) => (
					<Carousel.Slide key={item.id}>
						<motion.div
							initial='hidden'
							whileInView='visible'
							viewport={{ once: true }}
							transition={{ duration: 0.4, delay: index * 0.05 }}
							variants={{
								visible: { opacity: 1, scale: 1 },
								hidden: { opacity: 0, scale: 0.95 },
							}}
							style={{ width: itemWidth, height: itemHeight }}
						>
							<AiringAnimeScheduleItem item={item} />
						</motion.div>
					</Carousel.Slide>
				))}
			</Carousel>
		</Container>
	);
};

const AiringAnimeScheduleCarousel = () => {
	const airingAnimeSchedule = useShowsAiringScheduleCarousel();

	return (
		<Deferred
			data='airingSchedule'
			fallback={<AiringAnimeScheduleCarouselSkeleton />}
		>
			<AiringAnimeScheduleList items={airingAnimeSchedule} />
		</Deferred>
	);
};

export default AiringAnimeScheduleCarousel;
