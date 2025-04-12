import { genreDescriptions } from '@/data/genreDescriptions';
import { Carousel } from '@mantine/carousel';
import { AspectRatio, Container, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import {
	Activity,
	Baby,
	ChevronLeft,
	ChevronRight,
	Code,
	Compass,
	Ghost,
	HeartHandshake,
	Laugh,
	Star,
	Users,
} from 'lucide-react';
import { useRef, useState } from 'react';
import carouselClasses from './Carousel.module.css';
import ShowCard from './components/ShowCard';

type Genre = {
	id: string;
	name: string;
	icon: React.ReactNode;
	color: string;
	background: string;
	image: string;
	shows: Array<{
		id: string;
		title: string;
		image: string;
		rating: string;
		genre: string;
		year: string;
	}>;
};

const genres: Genre[] = [
	{
		id: 'cyberpunk',
		name: 'Cyberpunk',
		icon: <Code size={16} />,
		color: 'text-cyan-400',
		background: 'bg-cyan-950',
		image:
			'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		shows: [
			{
				id: 'c1',
				title: 'Neuromancer',
				image:
					'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
				rating: '9.2',
				genre: 'Cyberpunk',
				year: '2023',
			},
			{
				id: 'c2',
				title: 'Ghost Protocol',
				image:
					'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=762&q=80',
				rating: '8.5',
				genre: 'Cyberpunk',
				year: '2024',
			},
			{
				id: 'c3',
				title: 'Digital Nexus',
				image:
					'https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
				rating: '8.9',
				genre: 'Cyberpunk',
				year: '2023',
			},
		],
	},
	{
		id: 'action',
		name: 'Action',
		icon: <Activity size={16} />,
		color: 'text-red-400',
		background: 'bg-red-950',
		image:
			'https://images.unsplash.com/photo-1598387181067-8782c5b0339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		shows: [
			{
				id: 'a1',
				title: 'Velocity Strike',
				image:
					'https://images.unsplash.com/photo-1595565312451-23051ab0666c?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80',
				rating: '8.7',
				genre: 'Action',
				year: '2023',
			},
			{
				id: 'a2',
				title: 'Combat Zone',
				image:
					'https://images.unsplash.com/photo-1535981767287-35259dbf7d0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=736&q=80',
				rating: '9.1',
				genre: 'Action',
				year: '2024',
			},
			{
				id: 'a3',
				title: 'Rogue Operative',
				image:
					'https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?ixlib=rb-4.0.3&auto=format&fit=crop&w=736&q=80',
				rating: '8.6',
				genre: 'Action',
				year: '2023',
			},
		],
	},
	{
		id: 'adventure',
		name: 'Adventure',
		icon: <Compass size={16} />,
		color: 'text-amber-400',
		background: 'bg-amber-950',
		image:
			'https://images.unsplash.com/photo-1495063378081-52411c3eedf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		shows: [
			{
				id: 'adv1',
				title: 'Frontier Quest',
				image:
					'https://images.unsplash.com/photo-1482192505345-5655af888cc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=692&q=80',
				rating: '8.8',
				genre: 'Adventure',
				year: '2023',
			},
			{
				id: 'adv2',
				title: 'Nomad Chronicles',
				image:
					'https://images.unsplash.com/photo-1448518184296-a22facb4446f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
				rating: '9.0',
				genre: 'Adventure',
				year: '2024',
			},
			{
				id: 'adv3',
				title: 'Wild Discovery',
				image:
					'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
				rating: '8.5',
				genre: 'Adventure',
				year: '2023',
			},
		],
	},
	{
		id: 'family',
		name: 'Family',
		icon: <Users size={16} />,
		color: 'text-green-400',
		background: 'bg-green-950',
		image:
			'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		shows: [
			{
				id: 'f1',
				title: 'Family Ties',
				image:
					'https://images.unsplash.com/photo-1483034695875-9b894c34cecd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1508&q=80',
				rating: '8.4',
				genre: 'Family',
				year: '2023',
			},
			{
				id: 'f2',
				title: 'Homestead',
				image:
					'https://images.unsplash.com/photo-1585314962582-d5f8cadc32ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80',
				rating: '8.9',
				genre: 'Family',
				year: '2024',
			},
			{
				id: 'f3',
				title: 'Growing Together',
				image:
					'https://images.unsplash.com/photo-1516146544193-b54a65682f16?ixlib=rb-4.0.3&auto=format&fit=crop&w=686&q=80',
				rating: '8.3',
				genre: 'Family',
				year: '2023',
			},
		],
	},
	{
		id: 'kids',
		name: 'Kids',
		icon: <Baby size={16} />,
		color: 'text-purple-400',
		background: 'bg-purple-950',
		image:
			'https://images.unsplash.com/photo-1496065187959-7f07b8353c55?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		shows: [
			{
				id: 'k1',
				title: 'Giggles',
				image:
					'https://images.unsplash.com/photo-1588974807451-cbef977a3bf7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80',
				rating: '8.2',
				genre: 'Kids',
				year: '2023',
			},
			{
				id: 'k2',
				title: 'Playtime',
				image:
					'https://images.unsplash.com/photo-1528499908559-b8e4e8b89bda?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80',
				rating: '8.6',
				genre: 'Kids',
				year: '2024',
			},
			{
				id: 'k3',
				title: 'Adventures of Tiny Tim',
				image:
					'https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
				rating: '8.8',
				genre: 'Kids',
				year: '2023',
			},
		],
	},
	{
		id: 'comedy',
		name: 'Comedy',
		icon: <Laugh size={16} />,
		color: 'text-pink-400',
		background: 'bg-pink-950',
		image:
			'https://images.unsplash.com/photo-1543584756-a516a98aecd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		shows: [
			{
				id: 'com1',
				title: 'Laugh Factory',
				image:
					'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
				rating: '9.1',
				genre: 'Comedy',
				year: '2023',
			},
			{
				id: 'com2',
				title: 'Chuckles',
				image:
					'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
				rating: '8.7',
				genre: 'Comedy',
				year: '2024',
			},
			{
				id: 'com3',
				title: 'Laugh Riot',
				image:
					'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=761&q=80',
				rating: '8.9',
				genre: 'Comedy',
				year: '2023',
			},
		],
	},
	{
		id: 'drama',
		name: 'Drama',
		icon: <HeartHandshake size={16} />,
		color: 'text-violet-400',
		background: 'bg-violet-950',
		image:
			'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		shows: [
			{
				id: 'd1',
				title: 'Emotional Heights',
				image:
					'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=688&q=80',
				rating: '9.3',
				genre: 'Drama',
				year: '2023',
			},
			{
				id: 'd2',
				title: 'The Crossing',
				image:
					'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
				rating: '8.9',
				genre: 'Drama',
				year: '2024',
			},
			{
				id: 'd3',
				title: 'Internal Affairs',
				image:
					'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80',
				rating: '9.0',
				genre: 'Drama',
				year: '2023',
			},
		],
	},
	{
		id: 'horror',
		name: 'Horror',
		icon: <Ghost size={16} />,
		color: 'text-gray-400',
		background: 'bg-gray-950',
		image:
			'https://images.unsplash.com/photo-1509248961158-e54f6934749c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		shows: [
			{
				id: 'h1',
				title: 'The Haunting',
				image:
					'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
				rating: '8.7',
				genre: 'Horror',
				year: '2023',
			},
			{
				id: 'h2',
				title: 'Shadows Within',
				image:
					'https://images.unsplash.com/photo-1613144577614-1cf48c6d8976?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80',
				rating: '8.9',
				genre: 'Horror',
				year: '2024',
			},
			{
				id: 'h3',
				title: 'Night Terrors',
				image:
					'https://images.unsplash.com/photo-1555354812-691c8fd77912?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
				rating: '9.1',
				genre: 'Horror',
				year: '2023',
			},
		],
	},
];

function GenresSection() {
	const [selectedGenre, setSelectedGenre] = useState('cyberpunk');
	const currentGenre =
		genres.find((genre) => genre.id === selectedGenre) || genres[0];

	return (
		<div className='space-y-4'>
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
							{genres.map((genre) => (
								<motion.button
									key={genre.id}
									className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors text-sm
						${
							selectedGenre === genre.id
								? `${genre.color} ${genre.background} border-transparent`
								: 'bg-black/30 text-white/70 backdrop-blur-sm border-white/10 hover:bg-black/50'
						}`}
									onClick={() => setSelectedGenre(genre.id)}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.98 }}
								>
									{genre.icon}
									{genre.name}
								</motion.button>
							))}
						</div>
					</div>
				</motion.div>
			</AnimatePresence>

			<AnimatePresence>
				<motion.div
					key={selectedGenre}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className='mb-8 w-full'
				>
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
							className={`absolute inset-0 opacity-90 transition-colors duration-500 ${currentGenre.background}`}
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent' />

						<div className='absolute top-0 left-0 right-0 p-6'>
							<motion.h2
								className={`text-3xl font-bold mb-2 ${currentGenre.color}`}
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
								{genreDescriptions[currentGenre.name.toLowerCase()] ||
									genreDescriptions.default}
							</motion.p>

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
										height={300}
										slideSize={200}
										align='start'
										loop={false}
										slidesToScroll={1}
										withControls={true}
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
													viewport={{ once: true }}
													transition={{ duration: 0.5, delay: index * 0.1 }}
													variants={{
														visible: { opacity: 1, y: 0 },
														hidden: { opacity: 0, y: 30 },
													}}
												>
													<ShowCard
														show={{
															...show,
															genre: currentGenre.name,
															genreBackground: currentGenre.background,
														}}
														index={index}
													/>
												</motion.div>
											</Carousel.Slide>
										))}
									</Carousel>
								</Container>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

export default GenresSection;
