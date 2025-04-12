import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus } from 'lucide-react';
import { Badge, Box, Button, Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { EmblaCarouselType } from 'embla-carousel-react';

interface Show {
	id: number;
	title: string;
	logo: string;
	backdrop: string;
	overview: string;
	year: string;
	genres: string[];
	rating: string;
}

const featuredShows: Show[] = [
	{
		id: 1,
		title: 'Stranger Things',
		logo: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
		backdrop:
			'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
		year: '2016',
		genres: ['Sci-Fi', 'Horror', 'Drama'],
		rating: '8.7',
	},
	{
		id: 2,
		title: 'The Witcher',
		logo: 'https://image.tmdb.org/t/p/original/9h2EzzhkWyC5g305xDZnd0dp6Ac.png',
		backdrop:
			'https://images.unsplash.com/photo-1506818144585-74b29c980d4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
		year: '2019',
		genres: ['Fantasy', 'Action', 'Adventure'],
		rating: '8.2',
	},
	{
		id: 3,
		title: 'Squid Game',
		logo: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
		backdrop:
			'https://images.unsplash.com/photo-1560785496-3c9d27877182?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			"Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
		year: '2021',
		genres: ['Thriller', 'Drama', 'Mystery'],
		rating: '8.9',
	},
	{
		id: 4,
		title: 'Stranger Things',
		logo: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
		backdrop:
			'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
		year: '2016',
		genres: ['Sci-Fi', 'Horror', 'Drama'],
		rating: '8.7',
	},
	{
		id: 5,
		title: 'The Witcher',
		logo: 'https://image.tmdb.org/t/p/original/9h2EzzhkWyC5g305xDZnd0dp6Ac.png',
		backdrop:
			'https://images.unsplash.com/photo-1506818144585-74b29c980d4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
		year: '2019',
		genres: ['Fantasy', 'Action', 'Adventure'],
		rating: '8.2',
	},
	{
		id: 6,
		title: 'Squid Game',
		logo: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
		backdrop:
			'https://images.unsplash.com/photo-1560785496-3c9d27877182?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			"Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
		year: '2021',
		genres: ['Thriller', 'Drama', 'Mystery'],
		rating: '8.9',
	},
	{
		id: 7,
		title: 'Stranger Things',
		logo: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
		backdrop:
			'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
		year: '2016',
		genres: ['Sci-Fi', 'Horror', 'Drama'],
		rating: '8.7',
	},
	{
		id: 8,
		title: 'The Witcher',
		logo: 'https://image.tmdb.org/t/p/original/9h2EzzhkWyC5g305xDZnd0dp6Ac.png',
		backdrop:
			'https://images.unsplash.com/photo-1506818144585-74b29c980d4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
		year: '2019',
		genres: ['Fantasy', 'Action', 'Adventure'],
		rating: '8.2',
	},
	{
		id: 9,
		title: 'Squid Game',
		logo: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
		backdrop:
			'https://images.unsplash.com/photo-1560785496-3c9d27877182?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
		overview:
			"Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
		year: '2021',
		genres: ['Thriller', 'Drama', 'Mystery'],
		rating: '8.9',
	},
];

const AUTOPLAY_INTERVAL = 2000;

const ShowsBanner = () => {
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
				{featuredShows.map((show) => (
					<Carousel.Slide key={show.id}>
						<div className='relative w-full h-full'>
							<Image
								src={show.backdrop}
								alt={show.title}
								className='w-full h-full object-cover'
							/>
							<div className='absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent' />
							<div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent' />

							<div className='absolute bottom-0 left-0 right-0 px-8 md:px-16 py-20 flex flex-col md:flex-row items-end md:items-center justify-between'>
								<div className='w-full md:w-1/2 mb-8 md:mb-0'>
									<motion.div
										key={`${show.id}-rating-year-${currentIndex}`}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3, duration: 0.5 }}
										className='flex items-center space-x-2 mb-3'
									>
										<Badge>{show.rating}</Badge>
										<Badge>{show.year}</Badge>
									</motion.div>
									<motion.img
										key={`${show.id}-logo-${currentIndex}`}
										src={show.logo}
										alt={`${show.title} logo`}
										className='h-16 md:h-20 object-contain mb-4'
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.4, duration: 0.5 }}
									/>
									<motion.div
										key={`${show.id}-genres-${currentIndex}`}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5, duration: 0.5 }}
										className='flex flex-wrap gap-2 mb-4'
									>
										{show.genres.map((genre) => (
											<span
												key={genre}
												className='text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full'
											>
												{genre}
											</span>
										))}
									</motion.div>
									<motion.p
										key={`${show.id}-overview-${currentIndex}`}
										className='text-white/90 mb-6 text-sm md:text-base max-w-lg'
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.6, duration: 0.5 }}
									>
										{show.overview}
									</motion.p>
									<motion.div
										key={`${show.id}-buttons-${currentIndex}`}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.7, duration: 0.5 }}
										className='flex space-x-4'
									>
										<Button className='bg-white text-black hover:bg-white/90'>
											<Play
												size={16}
												className='mr-2'
											/>{' '}
											Play
										</Button>
										<Button
											variant='outline'
											className='border-white/20 text-white hover:bg-white/10'
										>
											<Plus
												size={16}
												className='mr-2'
											/>{' '}
											My List
										</Button>
									</motion.div>
								</div>

								<div className='flex space-x-2'>
									{featuredShows.map((_, idx) => (
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

export default ShowsBanner;
