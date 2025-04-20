import AiringAnimeCarousel from '@/Components/Animes/AiringAnimeCarousel';
import AnimesBanner from '@/Components/Animes/AnimesBanner';
import { GenresSection } from '@/Components/Animes/GenresSection';
import ResponsiveContainer from '@/Components/ResponsiveContainer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Space } from '@mantine/core';

function Animes() {
	return (
		<>
			<Head title='Animes' />
			<Space h={64} />
			<AnimesBanner />
			<Space h={64} />
			<ResponsiveContainer>
				<AiringAnimeCarousel />
				<Space h={24} />
				<GenresSection />
				{/* <TrailerSection />
				<Space h={24} />
				<Space h={48} />
				<AiringShowsCarousel />
				<Space h={48} />
				<StreamingSection /> */}
			</ResponsiveContainer>
			<Space h='xl' />
		</>
	);
}

Animes.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Animes;
