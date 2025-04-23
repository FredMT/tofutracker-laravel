import { Box, Group, Image, Paper, Stack, Text, Badge } from '@mantine/core';
import { Link } from '@inertiajs/react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import styles from './AiringAnimeScheduleCard.module.css';
import { ScheduleItem } from '@/propsHooks/useAnimesAiringSchedule';

interface AiringAnimeScheduleItemProps {
	item: ScheduleItem;
}

export default function AiringAnimeScheduleItem({
	item,
}: AiringAnimeScheduleItemProps) {
	return (
		<Box
			w={238}
			h={229}
			className={styles.cardBackground}
		>
			<Stack gap={0}>
				<Box
					w='100%'
					h={133}
					pos='relative'
				>
					{item.backdrop && (
						<Image
							src={`https://image.tmdb.org/t/p/w300${item.backdrop}`}
							alt={item.title}
							fit='cover'
							maw={238}
							mah={133}
							style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
						/>
					)}
					{item.logo && (
						<Box
							pos='absolute'
							bottom={8}
							left='50%'
							style={{ transform: 'translateX(-50%)', zIndex: 2 }}
						>
							<Image
								src={`https://image.tmdb.org/t/p/w154${item.logo}`}
								alt={`${item.title} Logo`}
								h={48}
								fit='contain'
								loading='lazy'
							/>
						</Box>
					)}
				</Box>
				<Paper
					p={10}
					h={96}
				>
					<Stack gap='xs'>
						<Group gap={8}>
							<Badge
								size='sm'
								variant='gradient'
								bg='grape'
							>
								{item.type}
							</Badge>
							<Badge
								size='sm'
								bg='#FACC15'
								c='black'
							>{`Episode ${item.episode_number}`}</Badge>
						</Group>
						<Link href={item.link}>
							<Text
								size='sm'
								lineClamp={1}
							>
								{item.title}
							</Text>
						</Link>
					</Stack>
					<Text
						size='sm'
						c='dimmed'
					>
						{dayjs.unix(item.episode_date).fromNow()}
					</Text>
				</Paper>
			</Stack>
		</Box>
	);
}
