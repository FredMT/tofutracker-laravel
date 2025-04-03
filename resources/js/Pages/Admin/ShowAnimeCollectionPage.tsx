import { ChainEntriesSection } from '@/Components/Admin/AnimeCollection/ChainEntriesSection';
import { RelatedEntriesSection } from '@/Components/Admin/AnimeCollection/RelatedEntriesSection';
import { EditableText } from '@/Components/EditableText';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import {
	Box,
	Button,
	Card,
	Grid,
	Group,
	Image,
	Space,
	Text,
	Title,
} from '@mantine/core';

export type ChainEntry = {
	id: number;
	chain_id: number;
	anime_id: number;
	sequence_order: number;
	picture: string | null;
	title_main: string;
};

export type ChainData = {
	name: string;
	importance_order: number;
	entries: ChainEntry[];
};

type AnimeMap = {
	id: number;
	collection_name: string | null;
	most_common_tmdb_id: number | null;
	tmdb_type: 'tv' | 'movie' | null;
	poster: string | null;
};

type RelatedEntry = {
	id: number;
	anime_id: number;
	picture: string | null;
	title_main: string;
};

type AnimeData = {
	anime_map: AnimeMap;
	chain_entries: Record<string, ChainData> | {};
	related_entries: RelatedEntry[] | [];
};

type ShowAnimeCollectionPageProps = {
	data: AnimeData;
};

function ShowAnimeCollectionPage({ data }: ShowAnimeCollectionPageProps) {
	const { chain_entries, related_entries } = data;

	return (
		<>
			<Space h={64} />
			<Box
				py={20}
				px={40}
			>
				<Title>Admin Anime Collection</Title>
				<Card>
					<Grid>
						{data.anime_map.poster && (
							<Grid.Col span={1}>
								<Image
									src={`https://image.tmdb.org/t/p/w154${data.anime_map.poster}`}
									alt='Anime Collection Poster'
									fit='cover'
									mah={200}
									maw={150}
								/>
							</Grid.Col>
						)}
						<Grid.Col span={data.anime_map.poster ? 11 : 12}>
							<Grid>
								<Grid.Col span={2}>
									<Text>Collection ID:</Text>
								</Grid.Col>
								<Grid.Col span={10}>
									<Text>{data.anime_map.id}</Text>
								</Grid.Col>

								<Grid.Col span={2}>
									<Text>Collection name:</Text>
								</Grid.Col>
								<Grid.Col span={10}>
									<EditableText
										initialText={data.anime_map.collection_name ?? ''}
										animeId={data.anime_map.id}
									/>
								</Grid.Col>

								<Grid.Col span={2}>
									<Text>TMDB ID:</Text>
								</Grid.Col>
								<Grid.Col span={10}>
									<Text>
										{data.anime_map.most_common_tmdb_id ?? 'TMDB ID not given'}
									</Text>
								</Grid.Col>

								<Grid.Col span={2}>
									<Text>TMDB Type:</Text>
								</Grid.Col>
								<Grid.Col span={10}>
									<Group>
										<Text>
											{data.anime_map.tmdb_type ?? 'TMDB Type not given'}
										</Text>
										{data.anime_map.most_common_tmdb_id &&
										data.anime_map.tmdb_type ? (
											<a
												href={`https://themoviedb.org/${data.anime_map.tmdb_type}/${data.anime_map.most_common_tmdb_id}`}
												target='_blank'
											>
												<Button>Visit TMDB</Button>
											</a>
										) : (
											<a
												href={`https://www.themoviedb.org/search?query=`}
												target='_blank'
											>
												<Button>Visit TMDB search page</Button>
											</a>
										)}
									</Group>
								</Grid.Col>
							</Grid>
						</Grid.Col>
					</Grid>
				</Card>
				<Space h='xl' />
				<ChainEntriesSection
					chainEntries={chain_entries}
					mapId={data.anime_map.id}
				/>
				<Space h='xl' />
				<RelatedEntriesSection
					relatedEntries={related_entries}
					mapId={data.anime_map.id}
				/>
			</Box>
		</>
	);
}

ShowAnimeCollectionPage.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default ShowAnimeCollectionPage;
