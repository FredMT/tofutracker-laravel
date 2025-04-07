import { Box, Image } from '@mantine/core';
import React from 'react';
import { Carousel } from '@mantine/carousel';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomeCarouselCard from './WelcomeCarouselCard';
import ResponsiveContainer from '@/Components/ResponsiveContainer';
import { WelcomeProviderCarousel } from './WelcomeProviderCarousel';
import { WatchProviderData, WatchProviderItem } from './DiscoverWatchProviders';

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
					padding: '20px 0',
				}}
			>
				<ResponsiveContainer>
					<WelcomeProviderCarousel
						providerId={providerId}
						slideSize='200px'
						onProviderChange={onProviderChange}
					>
						{data.items.map((item: WatchProviderItem) => (
							<Carousel.Slide key={`${item.media_type}-${item.id}`}>
								<WelcomeCarouselCard
									id={item.id}
									anime_id={item.anime_id}
									title={item.title}
									posterPath={item.poster_path}
									type={item.media_type}
									vote_average={item.vote_average}
								/>
							</Carousel.Slide>
						))}
					</WelcomeProviderCarousel>
				</ResponsiveContainer>
			</Box>
		</Box>
	);
}

export interface DiscoverWatchProvidersProps {
	providers: Record<string, WatchProviderData>;
}
