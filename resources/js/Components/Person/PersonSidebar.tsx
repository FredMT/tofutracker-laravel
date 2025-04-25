import {
	useHasCredits,
	usePersonContext,
} from '@/Components/Person/store/personStore';
import { Box, Button, Image, Stack } from '@mantine/core';
import React from 'react';

interface PersonSidebarProps {
	onTabChange: (value: string) => void;
}

export default function PersonSidebar({ onTabChange }: PersonSidebarProps) {
	const personData = usePersonContext((state) => ({
		person: state.person,
		activeTab: state.activeTab,
		movieCreditsCount: state.uniqueMovieCreditsCount,
		tvCreditsCount: state.uniqueTvCreditsCount,
	}));

	const { hasMovieCredits, hasTvCredits } = useHasCredits();

	return (
		<Box className='hidden md:block w-64 mr-8 flex-shrink-0'>
			<Box
				className='sticky'
				style={{ top: '250px' }}
			>
				<Box className='w-56 h-80 rounded-md overflow-hidden border-2 border-gray-800 shadow-xl mb-4 -translate-y-40'>
					{personData.person.profile_path && (
						<Image
							src={`https://image.tmdb.org/t/p/w500/${personData.person.profile_path}`}
							alt={personData.person.name}
							className='w-full h-full object-cover'
						/>
					)}
				</Box>

				<Box className='-translate-y-36'>
					<Stack gap='xs'>
						<Button
							variant={personData.activeTab === 'overview' ? 'light' : 'subtle'}
							color={personData.activeTab === 'overview' ? 'grape' : 'gray'}
							fullWidth
							onClick={() => onTabChange('overview')}
						>
							Overview
						</Button>

						{hasMovieCredits && (
							<Button
								variant={personData.activeTab === 'movies' ? 'light' : 'subtle'}
								color={personData.activeTab === 'movies' ? 'grape' : 'gray'}
								fullWidth
								onClick={() => onTabChange('movies')}
							>
								Movies ({personData.movieCreditsCount})
							</Button>
						)}

						{hasTvCredits && (
							<Button
								variant={personData.activeTab === 'tv' ? 'light' : 'subtle'}
								color={personData.activeTab === 'tv' ? 'grape' : 'gray'}
								fullWidth
								onClick={() => onTabChange('tv')}
							>
								TV Shows ({personData.tvCreditsCount})
							</Button>
						)}
					</Stack>
				</Box>
			</Box>
		</Box>
	);
}
