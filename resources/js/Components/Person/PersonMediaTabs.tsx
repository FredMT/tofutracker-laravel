import MediaCreditsList from '@/Components/Person/MediaCreditsList';
import PersonBiography from '@/Components/Person/PersonBiography';
import PersonKnownFor from '@/Components/Person/PersonKnownFor';
import { usePersonContext } from '@/Components/Person/store/personStore';
import { Box, Tabs, Text } from '@mantine/core';

interface PersonMediaTabsProps {
	tabsRef: React.RefObject<HTMLDivElement>;
	getMediaItem: (credit: any) => any;
	getTvMediaItem: (credit: any) => any;
	getAnimeMediaItem: (credit: any) => any;
}

export default function PersonMediaTabs({
	tabsRef,
	getMediaItem,
	getTvMediaItem,
	getAnimeMediaItem,
}: PersonMediaTabsProps) {
	const tabsData = usePersonContext((state) => ({
		activeTab: state.activeTab,
		setActiveTab: state.setActiveTab,
		movie_cast: state.movie_cast,
		movie_crew: state.movie_crew,
		tv_cast: state.tv_cast,
		tv_crew: state.tv_crew,
		anime_cast: state.anime_cast,
		anime_crew: state.anime_crew,
		uniqueMovieCreditsCount: state.uniqueMovieCreditsCount,
		uniqueTvCreditsCount: state.uniqueTvCreditsCount,
		uniqueAnimeCreditsCount: state.uniqueAnimeCreditsCount,
	}));

	return (
		<Box className='w-full'>
			<Tabs
				value={tabsData.activeTab}
				onChange={tabsData.setActiveTab}
				color='grape'
				variant='pills'
				ref={tabsRef}
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
						Movies ({tabsData.uniqueMovieCreditsCount})
					</Tabs.Tab>
					<Tabs.Tab
						value='tv'
						className='text-xs md:text-sm'
					>
						TV Shows ({tabsData.uniqueTvCreditsCount})
					</Tabs.Tab>
					<Tabs.Tab
						value='anime'
						className='text-xs md:text-sm'
					>
						Anime ({tabsData.uniqueAnimeCreditsCount})
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='overview'>
					<Box className='flex flex-col gap-8'>
						<PersonBiography />
						<PersonKnownFor
							getMediaItem={getMediaItem}
							getTvMediaItem={getTvMediaItem}
							getAnimeMediaItem={getAnimeMediaItem}
						/>
					</Box>
				</Tabs.Panel>

				<Tabs.Panel value='movies'>
					<MediaCreditsList
						title='Movies (Cast)'
						credits={tabsData.movie_cast}
						getMediaItemFunction={getMediaItem}
						roleKey='character'
						mediaType='movie'
					/>

					<MediaCreditsList
						title='Movies (Crew)'
						credits={tabsData.movie_crew}
						getMediaItemFunction={getMediaItem}
						roleKey='department'
						mediaType='movie'
					/>

					{tabsData.movie_cast.length === 0 &&
						tabsData.movie_crew.length === 0 && (
							<Box className='flex justify-center items-center h-40'>
								<Text c='dimmed'>No movie credits available</Text>
							</Box>
						)}
				</Tabs.Panel>

				<Tabs.Panel value='tv'>
					<MediaCreditsList
						title='TV Shows (Cast)'
						credits={tabsData.tv_cast}
						getMediaItemFunction={getTvMediaItem}
						roleKey='character'
						mediaType='tv'
					/>

					<MediaCreditsList
						title='TV Shows (Crew)'
						credits={tabsData.tv_crew}
						getMediaItemFunction={getTvMediaItem}
						roleKey='department'
						mediaType='tv'
					/>

					{tabsData.tv_cast.length === 0 && tabsData.tv_crew.length === 0 && (
						<Box className='flex justify-center items-center h-40'>
							<Text c='dimmed'>No TV credits available</Text>
						</Box>
					)}
				</Tabs.Panel>

				<Tabs.Panel value='anime'>
					<MediaCreditsList
						title='Anime (Cast)'
						credits={tabsData.anime_cast}
						getMediaItemFunction={getAnimeMediaItem}
						roleKey='character'
						mediaType='anime'
					/>

					<MediaCreditsList
						title='Anime (Crew)'
						credits={tabsData.anime_crew}
						getMediaItemFunction={getAnimeMediaItem}
						roleKey='department'
						mediaType='anime'
					/>

					{tabsData.anime_cast.length === 0 &&
						tabsData.anime_crew.length === 0 && (
							<Box className='flex justify-center items-center h-40'>
								<Text c='dimmed'>No anime credits available</Text>
							</Box>
						)}
				</Tabs.Panel>
			</Tabs>
		</Box>
	);
}
