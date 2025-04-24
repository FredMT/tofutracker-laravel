import { Box, Container, Paper, Space, Text, Title } from '@mantine/core';
import { AnimeCollectionTable } from '@/Components/AnimeCollection/AnimeCollectionTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { CollectionPagination } from '@/Components/AnimeCollection/components/CollectionPagination';
import { CollectionLoader } from '@/Components/AnimeCollection/components/CollectionLoader';
import { CollectionFilters } from '@/Components/AnimeCollection/components/CollectionFilters';
import { useAnimeCollectionStore } from '@/Components/AnimeCollection/store/animeCollectionStore';
import { initializeStoreFromUrl } from '@/Components/AnimeCollection/utils/initializeStoreFromUrl';
import { useCallback, useEffect, useState } from 'react';
import { useAnimeCollectionsPageData } from '@/propsHooks/useAnimeCollectionsPageData';

function AnimeCollectionPage() {
	const [isLoading, setIsLoading] = useState(false);
	const collections = useAnimeCollectionsPageData();

	const { applyFilters } = useAnimeCollectionStore();

	useEffect(() => {
		initializeStoreFromUrl();

		const handleStart = () => setIsLoading(true);
		const handleFinish = () => setIsLoading(false);

		document.addEventListener('inertia:start', handleStart);
		document.addEventListener('inertia:finish', handleFinish);

		return () => {
			document.removeEventListener('inertia:start', handleStart);
			document.removeEventListener('inertia:finish', handleFinish);
		};
	}, []);

	const handlePageChange = useCallback(
		(page: number) => {
			applyFilters(page);
		},
		[applyFilters]
	);

	return (
		<>
			<Head title='Anime Collections' />

			<Space h={64} />

			<Container
				size='xl'
				py='md'
			>
				<Paper p='md'>
					<Title
						order={1}
						mb='xs'
					>
						Anime Collections
					</Title>
					<Text
						c='dimmed'
						mb='lg'
					>
						Browse all anime collections with their chains and related entries.
					</Text>

					<CollectionFilters />

					<Box>
						{isLoading ? (
							<CollectionLoader />
						) : (
							<AnimeCollectionTable collections={collections.data} />
						)}
					</Box>

					<CollectionPagination
						meta={collections.meta}
						onPageChange={handlePageChange}
						isLoading={isLoading}
					/>
				</Paper>
			</Container>
		</>
	);
}

AnimeCollectionPage.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default AnimeCollectionPage;
