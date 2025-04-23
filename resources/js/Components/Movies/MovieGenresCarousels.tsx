import { getMovieGenreConfig } from '@/Components/Movies/movieGenresConfig';
import carouselClasses from '@/Components/Animes/Carousel.module.css';
import ImageMosaic from '@/Components/Animes/ImageMosaic';
import MediaCard from '@/Components/Common/MediaCard';
import { Carousel } from '@mantine/carousel';
import { Container, Space, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Movie {
	id: number;
	title: string;
	poster: string;
	rating: string;
	year: number;
	backdrop: string | null;
}

interface Genre {
	id: number;
	name: string;
	movies: Movie[];
}

export interface MovieGenresCarouselsProps {
	genresProp: Genre[] | null;
}

interface MergedGenre extends Genre {
	IconComponent: React.ComponentType<any>;
	color: string;
	background: string;
	image: string;
	description: string;
}

export function MovieGenresCarousels({
	genresProp,
}: MovieGenresCarouselsProps) {
	const backendGenres = useMemo(() => {
		if (Array.isArray(genresProp)) {
			return genresProp;
		}
		return [];
	}, [genresProp]);

	const mergedGenres: MergedGenre[] = useMemo(() => {
		if (!backendGenres.length) return [];

		return backendGenres.map((genre): MergedGenre => {
			const config = getMovieGenreConfig(genre.name);

			return {
				...genre,
				...config,
				IconComponent: config.IconComponent,
				movies: genre.movies,
			};
		});
	}, [backendGenres]);

	const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

	useEffect(() => {
		if (
			mergedGenres.length > 0 &&
			!mergedGenres.some((g) => g.id === selectedGenreId)
		) {
			setSelectedGenreId(mergedGenres[0].id);
		}
	}, [mergedGenres, selectedGenreId]);

	const currentGenre = useMemo(() => {
		if (selectedGenreId === null) return null;
		return mergedGenres.find((genre) => genre.id === selectedGenreId) || null;
	}, [selectedGenreId, mergedGenres]);

	const getRandomBackdrops = (movies: Movie[]): string[] => {
		const validMovies = movies.filter((movie) => movie.backdrop);

		if (validMovies.length <= 3) {
			return validMovies.map((movie) => movie.backdrop as string);
		}

		const randomBackdrops: string[] = [];
		const usedIndices = new Set<number>();

		while (
			randomBackdrops.length < 3 &&
			usedIndices.size < validMovies.length
		) {
			const randomIndex = Math.floor(Math.random() * validMovies.length);

			if (!usedIndices.has(randomIndex)) {
				usedIndices.add(randomIndex);
				const backdrop = validMovies[randomIndex].backdrop;
				if (backdrop) {
					randomBackdrops.push(backdrop);
				}
			}
		}

		return randomBackdrops;
	};

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
			<Title pl={60}>Genre Explorer</Title>

			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.3 }}
					className='overflow-hidden'
				>
					<div className='overflow-x-auto pb-2 hide-scrollbar pl-[60px]'>
						<div className='flex gap-2 min-w-max '>
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
										className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors text-sm`}
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
						<div className='relative h-[530px] rounded-xl overflow-hidden'>
							<motion.div
								className='w-full h-full'
								initial={{ scale: 1.1 }}
								animate={{ scale: 1 }}
								transition={{ duration: 1.5 }}
							>
								<ImageMosaic
									images={getRandomBackdrops(currentGenre.movies)}
									maxHeight='550px'
									className='px-0 py-0'
								/>
							</motion.div>
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
											withControls={currentGenre.movies.length > 5}
											controlsOffset={0}
											classNames={{
												control: carouselClasses.carouselControl,
												controls: carouselClasses.carouselControls,
											}}
											previousControlIcon={<ChevronLeft size={40} />}
											nextControlIcon={<ChevronRight size={40} />}
											className='w-full'
										>
											{currentGenre.movies.map((movie, index) => (
												<Carousel.Slide key={movie.id}>
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
														<MediaCard
															media={{
																id: movie.id,
																title: movie.title,
																poster: movie.poster,
																rating: String(movie.rating),
																year: String(movie.year),
																mediaType: 'movie',
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
