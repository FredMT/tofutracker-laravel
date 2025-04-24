import { useEffect, useMemo, useState } from 'react';
import {
	getGenreConfig,
	normalizeGenreName,
} from '@/Components/Shows/components/genresConfig';
import { Container, Space, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Carousel } from '@mantine/carousel';
import carouselClasses from '@/Components/Shows/Carousel.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ShowCard from '@/Components/Shows/components/ShowCard';
import {
	GenresCarouselsProps,
	MergedGenre,
	TransformedShow,
} from '@/Components/Shows/types';

export function GenresCarousels({ genresProp }: GenresCarouselsProps) {
	const backendGenres = useMemo(() => {
		if (Array.isArray(genresProp)) {
			return genresProp;
		} else if (genresProp && genresProp.genres) {
			return genresProp.genres;
		}
		return [];
	}, [genresProp]);

	const mergedGenres: MergedGenre[] = useMemo(() => {
		if (!backendGenres) return [];
		return backendGenres.map((genre): MergedGenre => {
			const config = getGenreConfig(genre.name);
			const transformedShows: TransformedShow[] = genre.shows.map((show) => ({
				...show,
				id: String(show.id),
				year: String(show.year),
				rating: String(show.rating),
			}));
			return {
				...genre,
				...config,
				id: normalizeGenreName(genre.name),
				shows: transformedShows,
			};
		});
	}, [backendGenres]);

	const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);

	useEffect(() => {
		if (
			mergedGenres.length > 0 &&
			!mergedGenres.some((g) => g.id === selectedGenreId)
		) {
			setSelectedGenreId(mergedGenres[0].id);
		}
	}, [mergedGenres, selectedGenreId]);

	const currentGenre = useMemo(() => {
		if (!selectedGenreId) return null;
		return mergedGenres.find((genre) => genre.id === selectedGenreId) || null;
	}, [selectedGenreId, mergedGenres]);

	if (!backendGenres || backendGenres.length === 0) {
		return (
			<div className='p-4 text-center text-gray-500'>
				No genres available at the moment.
			</div>
		);
	}

	if (!currentGenre) {
		return null;
	}

	return (
		<>
			<Title>Genre Explorer</Title>

			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.3 }}
					className='overflow-hidden'
				>
					<div className='overflow-x-auto pb-2 hide-scrollbar'>
						<div className='flex gap-2 min-w-max'>
							{mergedGenres.map((genre) => {
								const isSelected = selectedGenreId === genre.id;
								const buttonStyle: React.CSSProperties = isSelected
									? {
											backgroundColor: genre.background,
											color: genre.color,
											borderColor: 'transparent',
										}
									: {
											backgroundColor: 'rgba(0, 0, 0, 0.3)',
											color: 'var(--mantine-color-gray-4)',
											borderColor: 'var(--mantine-color-dark-4)',
										};

								return (
									<motion.button
										key={genre.id}
										className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors text-sm `}
										style={buttonStyle}
										onClick={() => setSelectedGenreId(genre.id)}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<genre.IconComponent size={16} />
										{genre.name}
									</motion.button>
								);
							})}
						</div>
					</div>
				</motion.div>
			</AnimatePresence>

			<AnimatePresence mode='wait'>
				<motion.div
					key={selectedGenreId}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className='mb-8 w-full'
				>
					{currentGenre && (
						<div className='relative h-[500px] rounded-xl overflow-hidden'>
							<motion.img
								src={currentGenre.image}
								alt={currentGenre.name}
								className='w-full h-full object-cover'
								initial={{ scale: 1.1 }}
								animate={{ scale: 1 }}
								transition={{ duration: 1.5 }}
							/>
							<div
								className={`absolute inset-0 opacity-90 transition-colors duration-500`}
								style={{ backgroundColor: currentGenre.background }}
							/>
							<div className='absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent' />
							<div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent' />

							<div className='absolute top-0 left-0 right-0 p-6'>
								<motion.h2
									className={`text-3xl font-bold mb-2`}
									style={{ color: currentGenre.color }}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2, duration: 0.4 }}
								>
									{currentGenre.name}
								</motion.h2>

								<motion.p
									className='text-white/90 mb-8 max-w-lg text-sm md:text-base'
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3, duration: 0.4 }}
								>
									{currentGenre.description}
								</motion.p>

								<Space h='md' />

								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4, duration: 0.4 }}
								>
									<Container
										size='100%'
										px={60}
										mx={0}
									>
										<Carousel
											slideSize={200}
											slideGap='md'
											align='start'
											loop={false}
											slidesToScroll='auto'
											withControls={currentGenre.shows.length > 5}
											controlsOffset={0}
											classNames={{
												control: carouselClasses.carouselControl,
												controls: carouselClasses.carouselControls,
											}}
											previousControlIcon={<ChevronLeft size={40} />}
											nextControlIcon={<ChevronRight size={40} />}
											className='w-full'
										>
											{currentGenre.shows.map((show, index) => (
												<Carousel.Slide key={show.id}>
													<motion.div
														initial='hidden'
														whileInView='visible'
														viewport={{ once: true, amount: 'some' }}
														transition={{ duration: 0.3, delay: index * 0.05 }}
														variants={{
															visible: { opacity: 1, y: 0 },
															hidden: { opacity: 0, y: 30 },
														}}
													>
														<ShowCard
															show={{
																...show,
															}}
														/>
													</motion.div>
												</Carousel.Slide>
											))}
										</Carousel>
									</Container>
								</motion.div>
							</div>
						</div>
					)}
				</motion.div>
			</AnimatePresence>
		</>
	);
}
