import { Link } from '@inertiajs/react';
import { Card, Image, Text, Badge, Group, Box, Rating } from '@mantine/core';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface MovieCardProps {
	movie: {
		id: string;
		title: string;
		poster: string;
		rating: string;
		year: string;
	};
}

export default function MovieCard({ movie }: MovieCardProps) {
	const posterUrl = movie.poster
		? `https://image.tmdb.org/t/p/w500${movie.poster}`
		: '/images/movie-placeholder.png';

	const parsedRating = parseFloat(movie.rating);
	const ratingOutOfFive = parsedRating / 2;

	return (
		<motion.div
			whileHover={{ scale: 1.03, y: -5 }}
			whileTap={{ scale: 0.97 }}
			transition={{ duration: 0.2 }}
		>
			<Link href={`/movies/${movie.id}`}>
				<Card
					shadow='sm'
					padding='xs'
					radius='md'
					withBorder
					style={{ width: 180 }}
					className='bg-dark-8 border-dark-6 hover:border-blue-5 transition-colors'
				>
					<Card.Section>
						<Image
							src={posterUrl}
							height={220}
							alt={movie.title}
							className='object-cover'
						/>
					</Card.Section>

					<Box
						mt='xs'
						mb='xs'
					>
						<Text
							size='sm'
							fw={500}
							lineClamp={1}
							title={movie.title}
						>
							{movie.title}
						</Text>
					</Box>

					<Group
						justify='space-between'
						mt='xs'
					>
						<Badge
							color='gray'
							variant='light'
							size='sm'
						>
							{movie.year}
						</Badge>
						<Rating
							value={ratingOutOfFive}
							fractions={2}
							readOnly
							size='xs'
							emptySymbol={
								<Star
									size={12}
									className='text-gray-600'
								/>
							}
							fullSymbol={
								<Star
									size={12}
									className='text-yellow-500 fill-yellow-500'
								/>
							}
						/>
					</Group>
				</Card>
			</Link>
		</motion.div>
	);
}
