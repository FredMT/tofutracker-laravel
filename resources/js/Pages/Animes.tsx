import AiringAnimeScheduleCarousel from '@/Components/Animes/AiringAnimeScheduleCarousel';
import { GenresSection } from '@/Components/Animes/GenresSection';
import TrailerSection from '@/Components/Animes/TrailerSection';
import MediaBanner from '@/Components/Common/MediaBanner';
import MediaCarousel from '@/Components/Common/MediaCarousel';
import ResponsiveContainer from '@/Components/ResponsiveContainer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { useAnimesPageAiring } from '@/propsHooks/useAnimesPageAiring';
import { useAnimesPageTrending } from '@/propsHooks/useAnimesPageTrending';
import { Head } from '@inertiajs/react';
import { Space } from '@mantine/core';

function Animes() {
	const animes = useAnimesPageTrending();

	return (
		<>
			<Head title='Animes' />
			<Space h={64} />
			<MediaBanner
				items={animes}
				type='anime'
			/>
			<Space h={24} />
			<ResponsiveContainer>
				<MediaCarousel
					items={animes}
					mediaType='anime'
					title='TOP 20'
					subtitle={['ANIME', 'CURRENTLY AIRING']}
				/>
				<Space h={24} />
				<AiringAnimeScheduleCarousel />
				<Space h={24} />
				<GenresSection />
				<Space h={24} />
				<TrailerSection />
			</ResponsiveContainer>
			<Space h='xl' />
		</>
	);
}

Animes.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Animes;
