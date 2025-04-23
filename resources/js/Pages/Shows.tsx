import MediaBanner from '@/Components/Common/MediaBanner';
import MediaCarousel from '@/Components/Common/MediaCarousel';
import ResponsiveContainer from '@/Components/ResponsiveContainer';
import AiringShowsCarousel from '@/Components/Shows/AiringShowsCarousel';
import { GenresSection } from '@/Components/Shows/GenresSection';
import StreamingSection from '@/Components/Shows/StreamingSection';
import TrailerSection from '@/Components/Shows/TrailerSection';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { useShowsPageTrendingData } from '@/propsHooks/useShowsPageTrending';
import { Head } from '@inertiajs/react';
import { Space } from '@mantine/core';

function Shows() {
	const shows = useShowsPageTrendingData();
	return (
		<>
			<Head title='Shows' />
			<Space h={64} />
			<MediaBanner
				items={shows}
				type='show'
			/>
			<Space h={64} />
			<ResponsiveContainer>
				<MediaCarousel
					items={shows}
					mediaType='tv'
					title='TOP 20'
					subtitle={['SHOWS', 'THIS WEEK']}
				/>
				<Space h={24} />
				<TrailerSection />
				<Space h={24} />
				<GenresSection />
				<Space h={48} />
				<AiringShowsCarousel />
				<Space h={48} />
				<StreamingSection />
			</ResponsiveContainer>
			<Space h='xl' />
		</>
	);
}

Shows.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Shows;
