import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { Box, Space, Title } from '@mantine/core';

type AnimeMap = {
	id: number;
	collection_name: string | null;
	most_common_tmdb_id: number | null;
	tmdb_type: 'tv' | 'movie' | null;
	poster: string | null;
};

type ChainEntry = {
	id: number;
	anime_id: number;
	sequence_order: number;
	picture: string | null;
	title_main: string;
};

type RelatedEntry = {
	id: number;
	anime_id: number;
	picture: string | null;
	title_main: string;
};

type AnimeData = {
	anime_map: AnimeMap;
	chain_entries: Record<number, ChainEntry[]> | [];
	related_entries: RelatedEntry[] | [];
};

type ShowAnimeCollectionPageProps = {
	data: AnimeData;
};

function ShowAnimeCollectionPage({ data }: ShowAnimeCollectionPageProps) {
	return (
		<>
			<Space h={64} />
			<Box
				py={20}
				px={40}
			>
				<Title>Admin Anime Collection Page</Title>
			</Box>
		</>
	);
}

ShowAnimeCollectionPage.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default ShowAnimeCollectionPage;
