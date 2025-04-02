import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { Box, Space, Title } from '@mantine/core';
import React from 'react';

function ShowAnimeCollectionPage() {
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
