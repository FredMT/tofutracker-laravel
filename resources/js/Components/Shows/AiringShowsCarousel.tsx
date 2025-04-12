import { useState, useEffect } from 'react';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { Card, Container, Paper, Space, Title, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import carouselClasses from './Carousel.module.css';
import cardClasses from './AiringShowsCard.module.css';

interface ShowProps {
	id: string;
	title: string;
	image: string;
	countdown: number;
	network: string;
	episodeNumber: number;
}

interface AiringShowsCarouselProps {}

const exampleCountdown = (days: number) =>
	dayjs().add(days, 'day').add(5, 'hour').unix();

const shows: ShowProps[] = [
	{
		id: '1',
		title: 'Silicon Valley Chronicles',
		image:
			'https://images.unsplash.com/photo-1496346651079-8c87a4178237?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		countdown: exampleCountdown(2),
		network: 'HBO',
		episodeNumber: 5,
	},
	{
		id: '2',
		title: 'Coding Conundrums',
		image:
			'https://images.unsplash.com/photo-1517373116369-9bdb8cdc9f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		countdown: exampleCountdown(3),
		network: 'Netflix',
		episodeNumber: 7,
	},
	{
		id: '3',
		title: 'The Startup',
		image:
			'https://images.unsplash.com/photo-1559132137-f8a4842e6a4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		countdown: exampleCountdown(4),
		network: 'Amazon',
		episodeNumber: 3,
	},
	{
		id: '4',
		title: 'Algo Wars',
		image:
			'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		countdown: exampleCountdown(5),
		network: 'Hulu',
		episodeNumber: 2,
	},
	{
		id: '5',
		title: 'Quantum Code',
		image:
			'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
		countdown: exampleCountdown(6),
		network: 'Apple TV+',
		episodeNumber: 1,
	},
	{
		id: '6',
		title: 'Error 404',
		image:
			'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=869&q=80',
		countdown: exampleCountdown(7),
		network: 'Disney+',
		episodeNumber: 8,
	},
];

interface CountdownTime {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

function ShowCountdown({ countdown: targetTimestamp }: { countdown: number }) {
	const [countdown, setCountdown] = useState<CountdownTime>(() => {
		const now = dayjs();
		const target = dayjs.unix(targetTimestamp);
		const diff = target.diff(now, 'second');
		if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
		const days = Math.floor(diff / (3600 * 24));
		const hours = Math.floor((diff % (3600 * 24)) / 3600);
		const minutes = Math.floor((diff % 3600) / 60);
		const seconds = diff % 60;
		return { days, hours, minutes, seconds };
	});

	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = dayjs();
			const target = dayjs.unix(targetTimestamp);
			const diff = target.diff(now, 'second');

			if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

			const days = Math.floor(diff / (3600 * 24));
			const hours = Math.floor((diff % (3600 * 24)) / 3600);
			const minutes = Math.floor((diff % 3600) / 60);
			const seconds = diff % 60;

			return { days, hours, minutes, seconds };
		};

		setCountdown(calculateTimeLeft());
		const timer = setInterval(() => {
			setCountdown(calculateTimeLeft());
		}, 1000);

		return () => clearInterval(timer);
	}, [targetTimestamp]);

	if (
		countdown.days === 0 &&
		countdown.hours === 0 &&
		countdown.minutes === 0 &&
		countdown.seconds === 0
	) {
		return (
			<Text
				size='sm'
				c='green.5'
			>
				Airing now!
			</Text>
		);
	}

	return (
		<Text
			size='sm'
			c='dimmed'
		>
			{countdown.days > 0 ? `${countdown.days}d ` : ''}
			{countdown.hours}h {countdown.minutes}m {countdown.seconds}s
		</Text>
	);
}

const AiringShowsCarousel = ({}: AiringShowsCarouselProps) => {
	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<Title>Upcoming Episodes</Title>

			<Space h='xl' />

			<Carousel
				height={250}
				align='start'
				loop={false}
				slideSize={270}
				slideGap={20}
				slidesToScroll={2}
				withControls={true}
				controlsOffset={0}
				classNames={{
					control: carouselClasses.carouselControl,
					controls: carouselClasses.carouselControls,
				}}
				previousControlIcon={<ChevronLeft size={40} />}
				nextControlIcon={<ChevronRight size={40} />}
			>
				{shows.map((show, index) => (
					<Carousel.Slide key={show.id}>
						<motion.div
							initial='hidden'
							whileInView='visible'
							viewport={{ once: true }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							variants={{
								visible: { opacity: 1, scale: 1 },
								hidden: { opacity: 0, scale: 0.95 },
							}}
						>
							<Paper>
								<div className='relative'>
									<img
										src={show.image}
										alt={show.title}
										className='aspect-video w-full object-cover'
									/>
									<div className='absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent p-4'>
										<div className='flex items-baseline justify-between'>
											<span className='rounded bg-accent/80 px-2 py-1 text-xs font-semibold '>
												Episode {show.episodeNumber}
											</span>
											<span className='text-xs font-medium '>
												{show.network}
											</span>
										</div>
									</div>
								</div>

								<Card
									unstyled
									className={`rounded-md rounded-t-none p-4 ${cardClasses.cardBackground}`}
								>
									<h3 className='mb-2 line-clamp-1 text-lg font-bold '>
										{show.title}
									</h3>

									<div className='mt-auto flex items-center justify-between'>
										<div className='flex items-center space-x-2'>
											<ShowCountdown countdown={show.countdown} />
										</div>
									</div>
								</Card>
							</Paper>
						</motion.div>
					</Carousel.Slide>
				))}
			</Carousel>
		</Container>
	);
};

export default AiringShowsCarousel;
