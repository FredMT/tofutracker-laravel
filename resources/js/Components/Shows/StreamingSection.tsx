import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Container, Select, Space, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import carouselClasses from './Carousel.module.css';
import classes from './StreamingSection.module.css';
import ShowCard from './components/ShowCard';

const mockProviders = [
	{ id: 'netflix', name: 'Netflix' },
	{ id: 'prime', name: 'Prime' },
	{ id: 'hbomax', name: 'Max' },
	{ id: 'disney', name: 'Disney+' },
	{ id: 'apple', name: 'AppleTV' },
	{ id: 'paramount', name: 'Paramount' },
	{ id: 'crunchyroll', name: 'Crunchyroll' },
	{ id: 'hulu', name: 'Hulu' },
	{ id: 'peacock', name: 'Peacock' },
	{ id: 'showtime', name: 'Showtime' },
	{ id: 'starz', name: 'Starz' },
	{ id: 'amc', name: 'AMC+' },
];

const mockShows = [
	{
		id: '1',
		title: 'Breaking Code',
		poster:
			'https://images.unsplash.com/photo-1542204637-e67bc7d41e48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1035&q=80',
		rating: '9.4',
		genre: 'Drama',
		year: '2023',
	},
	{
		id: '2',
		title: 'The Last Algorithm',
		poster:
			'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=925&q=80',
		rating: '8.9',
		genre: 'Science Fiction',
		year: '2023',
	},
	{
		id: '3',
		title: 'Digital Dreams',
		poster:
			'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		rating: '8.6',
		genre: 'Mystery',
		year: '2023',
	},
	{
		id: '4',
		title: 'Tech Titans',
		poster:
			'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		rating: '9.1',
		genre: 'Drama',
		year: '2023',
	},
	{
		id: '5',
		title: 'Cyber Detectives',
		poster:
			'https://images.unsplash.com/photo-1604144894893-530398584365?ixlib=rb-4.0.3&auto=format&fit=crop&w=724&q=80',
		rating: '8.8',
		genre: 'Crime',
		year: '2023',
	},
	{
		id: '6',
		title: 'Future Forward',
		poster:
			'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		rating: '9.2',
		genre: 'Science Fiction',
		year: '2023',
	},
];

const mockCountries = [
	{ value: 'us', label: 'United States' },
	{ value: 'ca', label: 'Canada' },
	{ value: 'gb', label: 'United Kingdom' },
	{ value: 'au', label: 'Australia' },
];

const StreamingSection = () => {
	const [selectedCountry, setSelectedCountry] = useState<string | null>('us');
	const [selectedProvider, setSelectedProvider] = useState(mockProviders[0].id);
	const tabsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (tabsRef.current) {
			const activeTab = tabsRef.current.querySelector(`.${classes.tabActive}`);
			if (activeTab) {
				const containerWidth = tabsRef.current.offsetWidth;
				const tabWidth = (activeTab as HTMLElement).offsetWidth;
				const tabLeft = (activeTab as HTMLElement).offsetLeft;
				const scrollPos = tabLeft - containerWidth / 2 + tabWidth / 2;

				tabsRef.current.scrollTo({
					left: Math.max(0, scrollPos),
					behavior: 'smooth',
				});
			}
		}
	}, [selectedProvider]);

	return (
		<>
			<div className={classes.titleContainer}>
				<Title>Streaming</Title>
				<div className={classes.countrySelector}>
					<Select
						placeholder='Pick country'
						data={mockCountries}
						value={selectedCountry}
						onChange={setSelectedCountry}
						searchable
					/>
				</div>
			</div>
			<Space h='md' />
			<div className={classes.header}>
				<div className={classes.tabsContainer}>
					<div
						className={classes.tabsList}
						ref={tabsRef}
					>
						{mockProviders.map((provider) => (
							<motion.div
								key={provider.id}
								className={`${classes.tab} ${
									selectedProvider === provider.id ? classes.tabActive : ''
								}`}
								onClick={() => setSelectedProvider(provider.id)}
								whileTap={{ scale: 0.95 }}
							>
								{provider.name}
								{selectedProvider === provider.id && (
									<motion.div
										layoutId='underline'
										className={classes.underline}
										transition={{ type: 'spring', stiffness: 300, damping: 30 }}
									/>
								)}
							</motion.div>
						))}
					</div>
				</div>
			</div>

			<Container
				size='100%'
				px={60}
				mx={0}
			>
				<Carousel
					height={300}
					slideSize={200}
					align='start'
					loop={false}
					slidesToScroll={1}
					controlsOffset={0}
					classNames={{
						control: carouselClasses.carouselControl,
						controls: carouselClasses.carouselControls,
					}}
					previousControlIcon={<ChevronLeft size={40} />}
					nextControlIcon={<ChevronRight size={40} />}
					className='w-full'
				>
					{mockShows.map((show, index) => (
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
								<ShowCard show={show} />
							</motion.div>
						</Carousel.Slide>
					))}
				</Carousel>
			</Container>
		</>
	);
};

export default StreamingSection;
