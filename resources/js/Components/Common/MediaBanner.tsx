import { Link } from '@inertiajs/react';
import { Carousel } from '@mantine/carousel';
import { Badge, Button, Image, Text } from '@mantine/core';
import Autoplay from 'embla-carousel-autoplay';
import { EmblaCarouselType } from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const AUTOPLAY_INTERVAL = 5500;

export interface MediaItem {
	id: number;
	title: string;
	logo: string | null;
	backdrop: string | null;
	overview: string;
	poster: string;
	year: string;
	genres: string[];
	rating: string;
}

interface MediaBannerProps {
	items: MediaItem[];
	maxItems?: number;
	type: 'movie' | 'tv' | 'anime';
}

const MediaBanner = ({ items, maxItems = 9, type }: MediaBannerProps) => {
	const featuredItems = items.slice(0, maxItems);
	const [currentIndex, setCurrentIndex] = useState(0);
	const autoplay = useRef(Autoplay({ delay: AUTOPLAY_INTERVAL }));
	const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);

	useEffect(() => {
		if (!emblaApi) return;

		const onSelect = () => {
			setCurrentIndex(emblaApi.selectedScrollSnap());
		};

		emblaApi.on('select', onSelect);
		onSelect();

		return () => {
			emblaApi.off('select', onSelect);
		};
	}, [emblaApi]);

	if (items.length === 0) {
		return null;
	}

	return (
		<div className='relative w-full h-[80vh] min-h-[80vh] overflow-hidden'>
			<Carousel
				getEmblaApi={setEmblaApi}
				withControls={false}
				withIndicators={false}
				loop
				plugins={[autoplay.current]}
				onMouseEnter={autoplay.current.stop}
				onMouseLeave={autoplay.current.reset}
				styles={{
					root: { height: '100%' },
					viewport: { height: '100%' },
					container: { height: '100%' },
				}}
			>
				{featuredItems.map((item) => (
					<Carousel.Slide key={item.id}>
						<div className='relative w-full h-full'>
							{item.backdrop && (
								<Image
									src={`https://image.tmdb.org/t/p/original${item.backdrop}`}
									alt={item.title}
									className='w-full h-full object-cover'
								/>
							)}
							<div className='absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent' />
							<div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent' />

							<div className='absolute bottom-0 left-0 right-0 px-8 md:px-16 py-20 flex flex-col md:flex-row items-end md:items-center justify-between'>
								<div className='w-full md:w-1/2 mb-8 md:mb-0'>
									<motion.div
										key={`${item.id}-rating-year-${currentIndex}`}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3, duration: 0.5 }}
										className='flex items-center space-x-2 mb-3'
									>
										<Badge
											color='black'
											c='white'
											size='lg'
											leftSection={<Star size={12} />}
										>
											{item.rating}
										</Badge>
										<Badge
											color='black'
											c='white'
											size='lg'
											leftSection={<Calendar size={12} />}
										>
											{item.year}
										</Badge>
									</motion.div>
									<Link href={`/${type}/${item.id}`}>
										{item.logo && (
											<motion.img
												key={`${item.id}-logo-${currentIndex}`}
												src={`https://image.tmdb.org/t/p/original${item.logo}`}
												alt={`${item.title} logo`}
												className='h-16 md:h-20 object-contain mb-4'
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.4, duration: 0.5 }}
											/>
										)}
										{!item.logo && (
											<motion.h2
												key={`${item.id}-title-${currentIndex}`}
												className='text-2xl md:text-4xl font-bold text-white mb-4'
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.4, duration: 0.5 }}
											>
												{item.title}
											</motion.h2>
										)}
									</Link>
									<motion.div
										key={`${item.id}-genres-${currentIndex}`}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5, duration: 0.5 }}
										className='flex flex-wrap gap-2 mb-4'
									>
										{item.genres.map((genre) => (
											<span
												key={genre}
												className='text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full'
											>
												{genre}
											</span>
										))}
									</motion.div>
									<Text
										component={motion.p}
										lineClamp={3}
										c='white'
										key={`${item.id}-overview-${currentIndex}`}
										className='text-white/90 mb-6 text-sm md:text-base max-w-lg'
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.6, duration: 0.5 }}
										mb='md'
									>
										{item.overview}
									</Text>
									<Link href={`/${type}/${item.id}`}>
										<motion.div
											key={`${item.id}-buttons-${currentIndex}`}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.7, duration: 0.5 }}
											className='flex space-x-4'
										>
											<Button
												variant='outline'
												className='border-white/20 text-white hover:bg-white/10'
												rightSection={<ArrowRight />}
											>
												View details
											</Button>
										</motion.div>
									</Link>
								</div>

								<div className='absolute top-[90%] left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:top-[75%] md:right-[10%] flex space-x-3'>
									{featuredItems.map((_, idx) => (
										<button
											key={idx}
											className={`w-2 h-8 rounded-full transition-all duration-300 ${
												idx === currentIndex ? 'bg-white' : 'bg-white/30'
											}`}
											onClick={() => emblaApi?.scrollTo(idx)}
										/>
									))}
								</div>
							</div>
						</div>
					</Carousel.Slide>
				))}
			</Carousel>
		</div>
	);
};

export default MediaBanner;
