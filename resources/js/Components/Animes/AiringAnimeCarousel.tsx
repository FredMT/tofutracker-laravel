import { useAnimesPageAiring } from '@/propsHooks/useAnimesPageAiring';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Box, Container } from '@mantine/core';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';
import carouselClasses from './Carousel.module.css';
import classes from './AiringAnimeCarousel.module.css';

interface AiringAnimeCarouselProps {}

const AiringAnimeCarousel = ({}: AiringAnimeCarouselProps) => {
	const animes = useAnimesPageAiring();

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
						<p className={classes.contentText}>ANIME</p>
						<p className={classes.contentText}>CURRENTLY AIRING</p>
					</div>
				</div>
				<div>
					<Carousel
						height={300}
						slideSize={200}
						align='start'
						loop={false}
						slidesToScroll='auto'
						withControls={true}
						inViewThreshold={0.9}
						controlsOffset={0}
						classNames={{
							control: carouselClasses.carouselControl,
							controls: carouselClasses.carouselControls,
						}}
						previousControlIcon={<ChevronLeft size={40} />}
						nextControlIcon={<ChevronRight size={40} />}
						className='w-full'
					>
						{animes.map((anime, index) => (
							<Carousel.Slide key={anime.id}>
								<motion.div
									initial='hidden'
									whileInView='visible'
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: index * 0.05 }}
									variants={{
										visible: { opacity: 1, y: 0 },
										hidden: { opacity: 0, y: 30 },
									}}
								>
									<AnimeCard
										anime={{
											id: String(anime.id),
											title: anime.title,
											poster: anime.poster,
											rating: anime.rating,
											year: anime.year,
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

export default AiringAnimeCarousel;
