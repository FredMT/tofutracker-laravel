import ScheduleItem from '@/Components/Schedule/ScheduleItem';
import { ScheduleItem as ScheduleItemType } from '@/propsHooks/useSchedulePageData';
import { useShowsAiringScheduleCarousel } from '@/propsHooks/useShowsAiringScheduleCarousel';
import { Deferred } from '@inertiajs/react';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Container, Skeleton, Space, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import carouselClasses from './Carousel.module.css';

const AiringShowsCarouselSkeleton = () => {
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

interface AiringShowsListProps {
	items: ScheduleItemType[];
}

const AiringShowsList: React.FC<AiringShowsListProps> = ({ items }) => {
	const itemWidth = 238;
	const itemHeight = 229;
	const slideGap = 20;

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<Title>Upcoming Episodes</Title>

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
							<ScheduleItem item={item} />
						</motion.div>
					</Carousel.Slide>
				))}
			</Carousel>
		</Container>
	);
};

const AiringShowsCarousel = () => {
	const airingShows = useShowsAiringScheduleCarousel();

	return (
		<Deferred
			data='airingShows'
			fallback={<AiringShowsCarouselSkeleton />}
		>
			<AiringShowsList items={airingShows} />
		</Deferred>
	);
};

export default AiringShowsCarousel;
