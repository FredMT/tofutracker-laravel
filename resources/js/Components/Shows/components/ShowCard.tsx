import { AspectRatio } from '@mantine/core';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShowProps {
	id: string;
	title: string;
	image: string;
	rating: string;
	year: string;
	genre?: string;
	genreBackground?: string;
}

interface ShowCardProps {
	show: ShowProps;
	index: number;
}

const ShowCard = ({ show, index }: ShowCardProps) => {
	return (
		<motion.div className='mx-2 h-full'>
			<AspectRatio
				ratio={2 / 3}
				className='h-full'
			>
				<div className='group relative h-full overflow-hidden rounded-lg'>
					<img
						src={show.image}
						alt={show.title}
						className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
					/>

					<div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

					<div className='absolute top-3 right-3 z-10 flex items-center space-x-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm'>
						<Star className='h-3 w-3 text-yellow-400' />
						<span className='text-xs font-medium text-white'>
							{show.rating}
						</span>
					</div>

					<div className='absolute inset-x-0 bottom-0 p-4 transform translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300'>
						<div className='mb-1 flex items-center space-x-2'>
							<span className='text-xs text-white/70'>{show.year}</span>
						</div>
						<h3 className='text-base font-bold text-white'>{show.title}</h3>
					</div>
				</div>
			</AspectRatio>
		</motion.div>
	);
};

export default ShowCard;
