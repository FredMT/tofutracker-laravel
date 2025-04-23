import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Box, Container } from '@mantine/core';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard, { MediaItemProps } from './MediaCard';
import classes from './Carousel.module.css';

interface MediaCarouselProps {
	items: Omit<MediaItemProps, 'mediaType'>[];
	mediaType: 'anime' | 'tv' | 'movie';
	title?: string;
	subtitle?: string[];
}

const MediaCarousel = ({
	items,
	mediaType,
	title,
	subtitle,
}: MediaCarouselProps) => {
	return (
		<Box h={title ? 386 : 320}>
			<Container
				size='100%'
				px={60}
				mx={0}
			>
				{title && subtitle && (
					<div className={classes.sectionHeaderTextWrapper}>
						<h2 className={classes.topText}>{title}</h2>
						<div style={{ marginBottom: '4px' }}>
							{subtitle.map((text, index) => (
								<p
									key={index}
									className={classes.contentText}
								>
									{text}
								</p>
							))}
						</div>
					</div>
				)}
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
							control: classes.carouselControl,
							controls: classes.carouselControls,
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
									transition={{ duration: 0.5, delay: index * 0.05 }}
									variants={{
										visible: { opacity: 1, y: 0 },
										hidden: { opacity: 0, y: 30 },
									}}
								>
									<MediaCard
										media={{
											...item,
											mediaType,
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

export default MediaCarousel;
