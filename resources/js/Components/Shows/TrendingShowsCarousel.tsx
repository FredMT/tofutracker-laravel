import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Container, AspectRatio, Box } from '@mantine/core';
import classes from './TrendingShowsCarousel.module.css';
import carouselClasses from './Carousel.module.css';
import ShowCard from './components/ShowCard';

interface ShowProps {
	id: string;
	title: string;
	image: string;
	rating: string;
	genre: string;
	year: string;
}

interface TrendingShowsCarouselProps {}

const shows: ShowProps[] = [
	{
		id: '1',
		title: 'Breaking Code',
		image:
			'https://images.unsplash.com/photo-1542204637-e67bc7d41e48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1035&q=80',
		rating: '9.4',
		genre: 'Drama',
		year: '2023',
	},
	{
		id: '2',
		title: 'The Last Algorithm',
		image:
			'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=925&q=80',
		rating: '8.9',
		genre: 'Science Fiction',
		year: '2023',
	},
	{
		id: '3',
		title: 'Digital Dreams',
		image:
			'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		rating: '8.6',
		genre: 'Mystery',
		year: '2023',
	},
	{
		id: '4',
		title: 'Tech Titans',
		image:
			'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		rating: '9.1',
		genre: 'Drama',
		year: '2023',
	},
	{
		id: '5',
		title: 'Cyber Detectives',
		image:
			'https://images.unsplash.com/photo-1604144894893-530398584365?ixlib=rb-4.0.3&auto=format&fit=crop&w=724&q=80',
		rating: '8.8',
		genre: 'Crime',
		year: '2023',
	},
	{
		id: '6',
		title: 'Future Forward',
		image:
			'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		rating: '9.2',
		genre: 'Science Fiction',
		year: '2023',
	},
];

const TrendingShowsCarousel = ({}: TrendingShowsCarouselProps) => {
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
										show={show}
										index={index}
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
