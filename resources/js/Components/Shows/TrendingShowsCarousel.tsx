import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Container, AspectRatio, Box } from '@mantine/core';
import classes from './TrendingShowsCarousel.module.css';
import carouselClasses from './Carousel.module.css';
import ShowCard from './components/ShowCard';
import { useShowsPageTrendingData } from '@/propsHooks/useShowsPageTrending';

interface TrendingShowsCarouselProps {}

const TrendingShowsCarousel = ({}: TrendingShowsCarouselProps) => {
	const shows = useShowsPageTrendingData();

	return (
		<Box h={386}>
			<Container
				size='100%'
				px={60}
				mx={0}
			>
				<div className={classes.sectionHeaderTextWrapper}>
					<h2 className={classes.topText}>TOP 20</h2>
					<div style={{ marginBottom: '4px' }}>
						<p className={classes.contentText}>SHOWS</p>
						<p className={classes.contentText}>THIS WEEK</p>
					</div>
				</div>
				<div>
					<Carousel
						height={300}
						slideSize={200}
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
						{shows.map((show, index) => (
							<Carousel.Slide key={show.id}>
								<motion.div
									initial='hidden'
									whileInView='visible'
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									variants={{
										visible: { opacity: 1, y: 0 },
										hidden: { opacity: 0, y: 30 },
									}}
								>
									<ShowCard
										show={{
											id: String(show.id),
											title: show.title,
											poster: show.poster,
											rating: show.rating,
											year: show.year,
										}}
									/>
								</motion.div>
							</Carousel.Slide>
						))}
					</Carousel>
				</div>
			</Container>
		</Box>
	);
};

export default TrendingShowsCarousel;
