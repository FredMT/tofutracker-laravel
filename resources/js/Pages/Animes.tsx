import AiringAnimeCarousel from '@/Components/Animes/AiringAnimeCarousel';
import AiringAnimeScheduleCarousel from '@/Components/Animes/AiringAnimeScheduleCarousel';
import AnimesBanner from '@/Components/Animes/AnimesBanner';
import { GenresSection } from '@/Components/Animes/GenresSection';
import TrailerSection from '@/Components/Animes/TrailerSection';
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
			<Space h={24} />
			<ResponsiveContainer>
				<AiringAnimeCarousel />
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
