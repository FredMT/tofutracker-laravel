import MediaCard, { MediaItemProps } from '@/Components/Common/MediaCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { usePersonCredits } from '@/propsHooks/usePersonCredits';
import { usePersonDetails } from '@/propsHooks/usePersonDetails';
import { usePersonExternalIds } from '@/propsHooks/usePersonExternalIds';
import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import {
	Badge,
	Button,
	Card,
	Divider,
	Group,
	Image,
	Space,
	Stack,
	Tabs,
	Text,
	Title,
	Box,
	ActionIcon,
} from '@mantine/core';
import {
	Bookmark,
	Calendar,
	ExternalLink,
	Heart,
	Instagram,
	RefreshCw,
	Share2,
	Twitter,
} from 'lucide-react';
import { useMemo } from 'react';

function Person() {
	const { movie_cast, movie_crew, tv_cast, tv_crew } = usePersonCredits();
	const person = usePersonDetails();
	const external_ids = usePersonExternalIds();

	// Select a random backdrop from movies or TV shows and remember its details
	const randomMediaDetails = useMemo(() => {
		const movieBackdrops = movie_cast
			.filter((movie) => movie.backdrop_path)
			.map((movie) => ({
				backdrop_path: movie.backdrop_path,
				title: movie.title,
				character: movie.character,
				mediaType: 'movie',
			}));

		const tvBackdrops = tv_cast
			.filter((show) => show.backdrop_path)
			.map((show) => ({
				backdrop_path: show.backdrop_path,
				title: show.title,
				character: show.character,
				mediaType: 'tv',
			}));

		const allBackdrops = [...movieBackdrops, ...tvBackdrops];
		if (allBackdrops.length === 0) return null;
		return allBackdrops[Math.floor(Math.random() * allBackdrops.length)];
	}, [movie_cast, tv_cast]);

	// Adapt credit item to MediaItemProps
	const getMediaItem = (credit: any): MediaItemProps => ({
		id: credit.id,
		title: credit.title,
		poster: credit.poster_path || '',
		rating: credit.rating?.toString() || 'N/A',
		year: credit.year || 'TBA',
		mediaType: credit.mediaType || (credit.title ? 'movie' : 'tv'),
	});

	// Calculate total unique credits
	const uniqueMovieCreditsCount = movie_cast.length + movie_crew.length;
	const uniqueTvCreditsCount = tv_cast.length + tv_crew.length;
	const totalCreditsCount = uniqueMovieCreditsCount + uniqueTvCreditsCount;

	const calculateAge = (birthday: string) => {
		if (!birthday) return 'N/A';
		const birthDate = new Date(birthday);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return 'N/A';
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		return new Date(dateString).toLocaleDateString('en-US', options);
	};

	return (
		<>
			<Space h={64} />
			<Box className='min-h-screen bg-dark'>
				{/* Hero section with backdrop */}
				<Box
					pos='relative'
					h={{ base: '65vh' }}
					className='overflow-hidden w-full'
				>
					{/* Darker overlay gradient */}
					<Box
						pos='absolute'
						inset={0}
						className='bg-gradient-to-b from-black/60 via-black/40 to-dark z-10'
					></Box>

					{/* Backdrop image */}
					<Box
						pos='absolute'
						inset={0}
						className='w-full'
					>
						{randomMediaDetails?.backdrop_path && (
							<Image
								src={`https://image.tmdb.org/t/p/original${randomMediaDetails.backdrop_path}`}
								alt='Backdrop'
								className='w-full h-full object-cover object-center opacity-75'
							/>
						)}
					</Box>

					{/* Content overlay */}
					<Box
						pos='relative'
						className='container mx-auto px-4 h-full flex flex-col justify-end'
					>
						{/* Profile and name section */}
						<Box className='relative w-full pb-4'>
							<Box className='flex flex-col md:flex-row items-end md:items-end gap-4 relative'>
								{/* Mobile profile picture */}
								<Box className='md:hidden absolute left-1/2 transform -translate-x-1/2 -translate-y-full w-full flex justify-center'>
									<Box className='size-48 rounded-md border-2 border-gray-700 shadow-lg flex-shrink-0'>
										<Image
											src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
											alt={person.name}
											className='w-full h-full object-cover'
										/>
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>

				{/* Person info section with sticky sidebar */}
				<Box className='container mx-auto px-4 md:pt-0 relative'>
					<Box className='flex flex-col md:flex-row'>
						{/* Sticky sidebar - desktop only */}
						<Box className='hidden md:block w-64 mr-8 flex-shrink-0'>
							{/* Sticky sidebar content */}
							<Box
								className='sticky'
								style={{ top: '250px' }}
							>
								{/* Profile picture */}
								<Box className='w-56 h-80 rounded-md overflow-hidden border-2 border-gray-800 shadow-xl mb-4 -translate-y-40'>
									<Image
										src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
										alt={person.name}
										className='w-full h-full object-cover'
									/>
								</Box>
							</Box>
						</Box>

						{/* Main content */}
						<Box className='flex-1'>
							<Stack
								gap='xs'
								mt='xl'
							>
								<Title className='text-3xl md:text-4xl'>{person.name}</Title>

								<Group
									gap='xs'
									className='justify-center md:justify-start'
								>
									<Badge
										variant='filled'
										color='dark'
										size='lg'
										className='border border-gray-700'
									>
										{person.known_for_department}
									</Badge>
									<Badge
										variant='filled'
										color='dark'
										size='lg'
										className='border border-gray-700'
									>
										{calculateAge(person.birthday ?? '')} years
									</Badge>
								</Group>

								<Group className='justify-center md:justify-start mt-2'>
									{external_ids.imdb_id && (
										<Button
											variant='outline'
											color='yellow'
											size='xs'
											component='a'
											href={`https://www.imdb.com/name/${external_ids.imdb_id}`}
											target='_blank'
											radius='xl'
										>
											IMDb
										</Button>
									)}
									{external_ids.instagram_id && (
										<ActionIcon
											variant='outline'
											color='violet'
											size='lg'
											component='a'
											href={`https://www.instagram.com/${external_ids.instagram_id}`}
											target='_blank'
											radius='xl'
										>
											<Instagram size={18} />
										</ActionIcon>
									)}
									{external_ids.twitter_id && (
										<ActionIcon
											variant='outline'
											color='blue'
											size='lg'
											component='a'
											href={`https://twitter.com/${external_ids.twitter_id}`}
											target='_blank'
											radius='xl'
										>
											<Twitter size={18} />
										</ActionIcon>
									)}
								</Group>
							</Stack>

							{/* Stats card */}
							<Box className='w-full mb-8'>
								<Group
									className='flex flex-wrap justify-center md:justify-start mt-4'
									gap='xl'
									wrap='wrap'
								>
									<Box>
										<Text c='dimmed'>AGE</Text>
										<Text>{calculateAge(person.birthday ?? '')}</Text>
									</Box>
									<Box>
										<Text c='dimmed'>GENDER</Text>
										<Text>{person.gender === 1 ? 'Female' : 'Male'}</Text>
									</Box>
									<Box>
										<Text c='dimmed'>BIRTHDAY</Text>
										<Text>{formatDate(person.birthday ?? '')}</Text>
									</Box>
									<Box>
										<Text c='dimmed'>BIRTHPLACE</Text>
										<Text>{person.place_of_birth ?? 'N/A'}</Text>
									</Box>
									<Box>
										<Text c='dimmed'>KNOWN FOR</Text>
										<Text>{person.known_for_department}</Text>
									</Box>
								</Group>
								<Group
									className='flex flex-wrap justify-center md:justify-start'
									mt='lg'
								>
									<Box className='rounded-lg text-center'>
										<Text
											size='lg'
											fw={700}
										>
											{totalCreditsCount}
										</Text>
										<Text
											size='xs'
											c='dimmed'
										>
											Credits
										</Text>
									</Box>
									<Box className='rounded-lg text-center'>
										<Text
											size='lg'
											fw={700}
										>
											{uniqueMovieCreditsCount}
										</Text>
										<Text
											size='xs'
											c='dimmed'
										>
											Movies
										</Text>
									</Box>
									<Box className='rounded-lg text-center'>
										<Text
											size='lg'
											fw={700}
										>
											{uniqueTvCreditsCount}
										</Text>
										<Text
											size='xs'
											c='dimmed'
										>
											TV Shows
										</Text>
									</Box>
								</Group>
							</Box>

							<Group
								gap='xs'
								className='justify-center md:justify-start mb-8'
							>
								<Button
									variant='light'
									color='grape'
									radius='xl'
								>
									<Heart className='w-3.5 h-3.5 mr-2' /> Favorite
								</Button>
								<Button
									variant='light'
									color='gray'
									radius='xl'
								>
									<Share2 className='w-3.5 h-3.5 mr-2' /> Share
								</Button>
							</Group>

							<Box className='w-full'>
								<Tabs
									defaultValue='overview'
									color='grape'
									variant='pills'
								>
									<Tabs.List className='mb-6'>
										<Tabs.Tab
											value='overview'
											className='text-xs md:text-sm'
										>
											Overview
										</Tabs.Tab>
										<Tabs.Tab
											value='movies'
											className='text-xs md:text-sm'
										>
											Movies ({uniqueMovieCreditsCount})
										</Tabs.Tab>
										<Tabs.Tab
											value='tv'
											className='text-xs md:text-sm'
										>
											TV Shows ({uniqueTvCreditsCount})
										</Tabs.Tab>
									</Tabs.List>

									<Tabs.Panel value='overview'>
										<Box className='flex flex-col gap-8'>
											<Box>
												<Title
													order={4}
													mb='md'
												>
													Biography
												</Title>
												<Text
													size='sm'
													className='text-pretty'
												>
													{person.biography || 'No biography available.'}
												</Text>
											</Box>

											<Box>
												<Title
													order={4}
													mb='md'
												>
													Known For
												</Title>
												<Box className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
													{movie_cast.slice(0, 6).map((credit) => (
														<Box
															key={`known-for-${credit.id}`}
															className='flex flex-col'
														>
															<MediaCard media={getMediaItem(credit)} />
														</Box>
													))}
												</Box>
											</Box>
										</Box>
									</Tabs.Panel>

									<Tabs.Panel value='movies'>
										{movie_cast.length > 0 && (
											<>
												<Group
													justify='apart'
													mb='md'
												>
													<Title order={4}>Movies (Cast)</Title>
													<Badge
														variant='filled'
														color='blue'
														size='lg'
													>
														{movie_cast.length}
													</Badge>
												</Group>

												<Divider mb='lg' />

												<Box className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10'>
													{movie_cast.map((credit) => (
														<Box
															key={`cast-${credit.id}`}
															className='flex flex-col'
														>
															<MediaCard media={getMediaItem(credit)} />
															<Text
																size='xs'
																c='dimmed'
																mt={8}
																ta='center'
																lineClamp={1}
															>
																{credit.character}
															</Text>
														</Box>
													))}
												</Box>
											</>
										)}

										{movie_crew.length > 0 && (
											<>
												<Group
													justify='apart'
													mb='md'
												>
													<Title order={4}>Movies (Crew)</Title>
													<Badge
														variant='filled'
														color='blue'
														size='lg'
													>
														{movie_crew.length}
													</Badge>
												</Group>

												<Divider mb='lg' />

												<Box className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
													{movie_crew.map((credit) => (
														<Box
															key={`crew-${credit.id}`}
															className='flex flex-col'
														>
															<MediaCard media={getMediaItem(credit)} />
															<Text
																size='xs'
																c='dimmed'
																mt={8}
																ta='center'
																lineClamp={1}
															>
																{credit.department}
															</Text>
														</Box>
													))}
												</Box>
											</>
										)}

										{movie_cast.length === 0 && movie_crew.length === 0 && (
											<Box className='flex justify-center items-center h-40'>
												<Text c='dimmed'>No movie credits available</Text>
											</Box>
										)}
									</Tabs.Panel>

									<Tabs.Panel value='tv'>
										{tv_cast.length > 0 && (
											<>
												<Group
													justify='apart'
													mb='md'
												>
													<Title order={4}>TV Shows (Cast)</Title>
													<Badge
														variant='filled'
														color='blue'
														size='lg'
													>
														{tv_cast.length}
													</Badge>
												</Group>

												<Divider mb='lg' />

												<Box className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10'>
													{tv_cast.map((credit) => (
														<Box
															key={`tv-cast-${credit.id}`}
															className='flex flex-col'
														>
															<MediaCard media={getMediaItem(credit)} />
															<Text
																size='xs'
																c='dimmed'
																mt={8}
																ta='center'
																lineClamp={1}
															>
																{credit.character}
															</Text>
														</Box>
													))}
												</Box>
											</>
										)}

										{tv_crew.length > 0 && (
											<>
												<Group
													justify='apart'
													mb='md'
												>
													<Title order={4}>TV Shows (Crew)</Title>
													<Badge
														variant='filled'
														color='blue'
														size='lg'
													>
														{tv_crew.length}
													</Badge>
												</Group>

												<Divider mb='lg' />

												<Box className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
													{tv_crew.map((credit) => (
														<Box
															key={`tv-crew-${credit.id}`}
															className='flex flex-col'
														>
															<MediaCard media={getMediaItem(credit)} />
															<Text
																size='xs'
																c='dimmed'
																mt={8}
																ta='center'
																lineClamp={1}
															>
																{credit.department}
															</Text>
														</Box>
													))}
												</Box>
											</>
										)}

										{tv_cast.length === 0 && tv_crew.length === 0 && (
											<Box className='flex justify-center items-center h-40'>
												<Text c='dimmed'>No TV credits available</Text>
											</Box>
										)}
									</Tabs.Panel>
								</Tabs>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	);
}

Person.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Person;
