import { Carousel } from '@mantine/carousel';
import { Box, Image } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { WatchProviderData, WatchProviderItem } from './DiscoverWatchProviders';
import WelcomeCarouselCard from './WelcomeCarouselCard';
import { WelcomeProviderCarousel } from './WelcomeProviderCarousel';
import classes from './WelcomeCustomCarousel.module.css';
import ResponsiveContainer from '../ResponsiveContainer';

interface DiscoverWatchProviderProps {
	providerId: string;
	data: WatchProviderData;
	onProviderChange: (providerId: string) => void;
}

const backgroundVariants = {
	initial: { opacity: 0 },
	animate: { opacity: 1, transition: { duration: 0.5 } },
	exit: { opacity: 0, transition: { duration: 0.5 } },
};

const cardVariants = {
	initial: { opacity: 0 },
	animate: { opacity: 1, transition: { duration: 0.3 } },
	exit: { opacity: 0, transition: { duration: 0.3 } },
};

export function DiscoverWatchProvider({
	providerId,
	data,
	onProviderChange,
}: DiscoverWatchProviderProps) {
	const backgroundImage = data.items[0]?.backdrop_path
		? `https://image.tmdb.org/t/p/w1280${data.items[0].backdrop_path}`
		: '';

	return (
		<Box
			pos='relative'
			h={700}
			mb='xl'
		>
			<AnimatePresence initial={false}>
				<motion.div
					key={backgroundImage}
					variants={backgroundVariants}
					initial='initial'
					animate='animate'
					exit='exit'
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
					}}
				>
					<Image
						src={backgroundImage}
						h='100%'
						w='100%'
						fit='cover'
						style={{
							filter: 'brightness(0.7)',
						}}
						loading='lazy'
					/>
				</motion.div>
			</AnimatePresence>
			<Box
				pos='absolute'
				bottom={0}
				left={0}
				right={0}
				style={{
					background:
						'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
					padding: '20px ',
				}}
			>
				<ResponsiveContainer>
					<WelcomeProviderCarousel
						providerId={providerId}
						slideSize='200px'
						onProviderChange={onProviderChange}
					>
						<AnimatePresence mode='wait'>
							{data.items.map((item: WatchProviderItem, index) => (
								<motion.div
									key={`${item.media_type}-${item.id}`}
									variants={cardVariants}
									initial='initial'
									animate='animate'
									exit='exit'
									className={index === 0 ? classes.firstItem : ''}
								>
									<Carousel.Slide>
										<WelcomeCarouselCard
											id={item.id}
											anime_id={item.anime_id}
											title={item.title}
											posterPath={item.poster_path}
											type={item.media_type}
											vote_average={item.vote_average}
										/>
									</Carousel.Slide>
								</motion.div>
							))}
						</AnimatePresence>
					</WelcomeProviderCarousel>
				</ResponsiveContainer>
			</Box>
		</Box>
	);
}

export interface DiscoverWatchProvidersProps {
	providers: Record<string, WatchProviderData>;
}
