import { CreateMapButtonGroup } from '@/Components/Admin/CreateMapButtonGroup';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import {
	AspectRatio,
	Box,
	Button,
	ButtonGroup,
	Card,
	Divider,
	Group,
	Image,
	LoadingOverlay,
	Paper,
	Space,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useState } from 'react';

type MapData = {
	most_common_tmdb_id: number;
	tmdb_type: 'tv' | 'movie';
	collection_name: string;
};

type AdminAnimePage = {
	id: number;
	type: string;
	title_main: string;
	picture: string;
	map_id: number;
	possible_tmdb_id: number | null;
	map_data: MapData | null;
};

function ShowAnimePage({ data }: { data: AdminAnimePage }) {
	const [visible, setVisible] = useState(false);
	return (
		<>
			<Space h={64} />
			<Box
				py={20}
				px={40}
				pos='relative'
			>
				<LoadingOverlay
					visible={visible}
					zIndex={1000}
					overlayProps={{ radius: 'sm', blur: 2 }}
				/>

				<Stack>
					<Title>Admin Anime page</Title>
					<Group
						align='flex-start'
						gap='xl'
					>
						<AspectRatio
							ratio={2 / 3}
							maw={180}
						>
							<img
								src={`https://anidb.net/images/main/${data.picture}`}
								alt={data.title_main}
								loading='eager'
								decoding='sync'
							/>
						</AspectRatio>
						<Paper>
							<Stack>
								<Group>
									<Title order={3}>{data.title_main}</Title>
									<a
										href={`https://www.anidb.net/anime/${data.id}`}
										target='_blank'
									>
										<Button>See on AniDB</Button>
									</a>
								</Group>
								<Text>Type: {data.type}</Text>
								<Card>
									{data.map_id ? (
										<Stack>
											<Group>
												<Text>Map ID: {data.map_id}</Text>
												<Link
													href={route('admin.showAdminAnimeCollectionPage', {
														animeMap: data.map_id,
													})}
												>
													<Button>View anime collection</Button>
												</Link>
											</Group>
											<Divider />
											{data.map_data && (
												<Group>
													<Stack>
														<Text>
															Map TMDB ID: {data.map_data.most_common_tmdb_id}
														</Text>
														<Text>
															Map TMDB Type: {data.map_data.tmdb_type}
														</Text>
													</Stack>

													{data.map_data?.most_common_tmdb_id &&
														data.map_data?.tmdb_type && (
															<>
																<Divider orientation='vertical' />
																<a
																	href={`https://www.themoviedb.org/${data.map_data?.tmdb_type}/${data.map_data.most_common_tmdb_id}`}
																	target='_blank'
																>
																	<Button>View exact mapped TMDB page</Button>
																</a>
															</>
														)}
												</Group>
											)}
											<Divider />
											<Text>
												Collection name: {data.map_data?.collection_name}
											</Text>
										</Stack>
									) : (
										<Stack>
											<Text>Map ID: No Map ID Found</Text>
											<Text>Create map for this anime:</Text>
											<CreateMapButtonGroup
												id={data.id}
												loadingOverlayVisible={setVisible}
											/>
										</Stack>
									)}
								</Card>
								<Card>
									<Stack>
										<Text>
											Possible TMDB ID:{' '}
											{data.possible_tmdb_id ?? 'No TMDB ID found'}
										</Text>
										{data.possible_tmdb_id ? (
											<Group>
												<a
													href={`https://www.themoviedb.org/tv/${data.possible_tmdb_id}`}
													target='_blank'
												>
													<Button>TMDB TV Page</Button>
												</a>
												<a
													href={`https://www.themoviedb.org/movie/${data.possible_tmdb_id}`}
													target='_blank'
												>
													<Button>TMDB Movie Page</Button>
												</a>
											</Group>
										) : (
											<>
												<a
													href={`https://www.themoviedb.org/search?query=${data.title_main}`}
													target='_blank'
												>
													<Button fullWidth>Search on TMDB</Button>
												</a>
											</>
										)}
									</Stack>
								</Card>
							</Stack>
						</Paper>
					</Group>
				</Stack>
			</Box>
		</>
	);
}

ShowAnimePage.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default ShowAnimePage;
