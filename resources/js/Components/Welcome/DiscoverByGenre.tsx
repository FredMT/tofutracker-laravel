import { Carousel } from '@mantine/carousel';
import {
	BackgroundImage,
	Box,
	Card,
	Container,
	ContainerProps,
	Drawer,
	Flex,
	Group,
	Modal,
	Space,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import classes from './WelcomeCustomCarousel.module.css';
import WelcomeCarouselCard from './WelcomeCarouselCard';

interface GenreItem {
	id: string | number;
	anime_id?: number;
	media_type: string;
	title: string;
	release_date: string;
	vote_average: number;
	popularity: number;
	poster_path: string | null;
	backdrop_path: string | null;
}

interface GenreData {
	genre_name: string;
	items: GenreItem[];
}

interface DiscoverByGenreProps {
	containerWidth?: ContainerProps['size'];
	slideSize?: string;
	height?: number;
	slidesToScroll?: number;
	withControls?: boolean;
	align?: 'start' | 'center' | 'end';
	className?: string;
	slideGap?: number;
	titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
	genres: Record<string, GenreData>;
}

export function DiscoverByGenre({
	containerWidth = '100%',
	slideSize = '300px',
	height = 300,
	slidesToScroll = 3,
	withControls = true,
	align = 'start',
	slideGap = 0,
	className,
	titleOrder = 3,
	genres,
}: DiscoverByGenreProps) {
	const isMobile = useMediaQuery('(max-width: 600px)');
	const isSmall = useMediaQuery('(max-width: 48em)');
	const [activeGenreId, setActiveGenreId] = React.useState<string>(
		Object.keys(genres)[0] || ''
	);
	const [opened, { open, close }] = useDisclosure(false);
	const [imageOpacities, setImageOpacities] = useState<Record<string, number>>(
		{}
	);
	const [showImages, setShowImages] = useState(false);

	useEffect(() => {
		const initialOpacities = Object.keys(genres).reduce((acc, genreId) => {
			acc[genreId] = 0;
			return acc;
		}, {} as Record<string, number>);
		setImageOpacities(initialOpacities);
	}, [genres]);

	useEffect(() => {
		if (opened) {
			const timeout = setTimeout(() => {
				requestAnimationFrame(() => {
					setShowImages(true);
				});
			}, 200); // slight delay to allow modal to mount first
			return () => {
				clearTimeout(timeout);
				setShowImages(false);
			};
		} else {
			setShowImages(false);
		}
	}, [opened]);

	const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;
	const activeGenre = genres[activeGenreId];

	if (!activeGenre) return null;

	const genreSelector = (
		<Group
			gap='xs'
			style={{ cursor: 'pointer' }}
			onClick={open}
		>
			<Title order={titleOrder}>{activeGenre.genre_name}</Title>
			<ChevronDown size={24} />
		</Group>
	);
	const genreCards = (
		<Flex
			gap='md'
			justify='flex-start'
			align='stretch'
			direction='row'
			wrap='wrap'
		>
			{Object.entries(genres).map(([genreId, genre]) => (
				<Card
					key={genreId}
					shadow='sm'
					p={0}
					radius='md'
					withBorder
					style={{
						cursor: 'pointer',
						width: isSmall ? '100%' : 'calc(33.33% - 16px)',
						backgroundColor:
							activeGenreId === genreId
								? 'var(--mantine-color-blue-light)'
								: undefined,
					}}
					onClick={() => {
						setActiveGenreId(genreId);
						close();
					}}
				>
					{showImages && (
						<img
							src={`/genre_images/${genre.genre_name
								.replaceAll('&', 'and')
								.replaceAll(' ', '')
								.toLowerCase()}.webp`}
							style={{
								filter: 'brightness(0.2)',
								height: '100%',
								width: '100%',
								position: 'absolute',
								top: 0,
								left: 0,
								borderRadius: '5px',
								objectFit: 'cover',
								opacity: imageOpacities[genreId] ?? 0,
								transition: 'opacity 0.5s ease-in-out',
							}}
							loading='lazy'
							onLoad={() =>
								setImageOpacities((prev) => ({ ...prev, [genreId]: 1 }))
							}
						/>
					)}
					<Box
						p={20}
						style={{ position: 'relative', zIndex: 2 }}
					>
						<Text
							fw={500}
							size='lg'
						>
							{genre.genre_name}
						</Text>
						<Text size='sm'>{genre.items.length} items</Text>
					</Box>
				</Card>
			))}
		</Flex>
	);

	return (
		<Stack gap='xs'>
			{isMobile ? (
				<Stack gap='xs'>
					<Title order={titleOrder}>Discover by Genre</Title>
					{genreSelector}
				</Stack>
			) : (
				<Group pl='xl'>
					<Title order={titleOrder}>Discover by Genre:</Title>
					{genreSelector}
				</Group>
			)}
			<Space h='xs' />
			<Container
				size={containerWidth}
				className='select-none'
				px={0}
				mx={0}
			>
				<Carousel
					key={activeGenreId}
					height={height}
					slideSize={slideSize}
					align={align}
					slidesToScroll={mobileSlidesToScroll}
					withControls={withControls}
					previousControlIcon={<ChevronLeft size={40} />}
					nextControlIcon={<ChevronRight size={40} />}
					controlsOffset={0}
					classNames={{
						control: classes.carouselControl,
						controls: classes.carouselControls,
					}}
					className={className}
					slideGap={slideGap}
				>
					{activeGenre.items.map((item: GenreItem) => (
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
				</Carousel>
			</Container>

			{isSmall ? (
				<Drawer
					opened={opened}
					onClose={close}
					title='Select a Genre'
					position='bottom'
					size='90%'
				>
					{genreCards}
				</Drawer>
			) : (
				<Modal
					opened={opened}
					onClose={close}
					title='Select a Genre'
					size='xl'
				>
					{genreCards}
				</Modal>
			)}
		</Stack>
	);
}

export default DiscoverByGenre;
