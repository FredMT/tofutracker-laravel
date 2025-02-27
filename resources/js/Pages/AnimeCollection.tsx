import { Box, Container, Paper, Title, Text, Space } from "@mantine/core";
import { AnimeCollectionTable } from "@/Components/AnimeCollection/AnimeCollectionTable";
import { AnimeCollectionsResponse } from "@/Components/AnimeCollection/types/animeCollections";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { CollectionPagination } from "@/Components/AnimeCollection/components/CollectionPagination";
import { CollectionLoader } from "@/Components/AnimeCollection/components/CollectionLoader";
import { CollectionFilters } from "@/Components/AnimeCollection/components/CollectionFilters";
import { useAnimeCollectionStore } from "@/Components/AnimeCollection/store/animeCollectionStore";
import { initializeStoreFromUrl } from "@/Components/AnimeCollection/utils/initializeStoreFromUrl";
import { useCallback, useEffect, useState } from "react";

interface AnimeCollectionPageProps {
    collections: AnimeCollectionsResponse;
}

function AnimeCollectionPage({ collections }: AnimeCollectionPageProps) {
    // Track loading state
    const [isLoading, setIsLoading] = useState(false);

    // Access the collection store for applying filters
    const { applyFilters } = useAnimeCollectionStore();

    // Setup router event listeners for page loads and initialize store from URL
    useEffect(() => {
        // Initialize store from URL parameters
        initializeStoreFromUrl();

        // Setup loading state handlers
        const handleStart = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        document.addEventListener("inertia:start", handleStart);
        document.addEventListener("inertia:finish", handleFinish);

        // Clean up event listeners
        return () => {
            document.removeEventListener("inertia:start", handleStart);
            document.removeEventListener("inertia:finish", handleFinish);
        };
    }, []);

    // Handle page changes
    const handlePageChange = useCallback(
        (page: number) => {
            applyFilters(page);
        },
        [applyFilters]
    );

    return (
        <>
            <Head title="Anime Collections" />

            <Space h={64} />

            <Container size="xl" py="md">
                <Paper p="md">
                    <Title order={1} mb="xs">
                        Anime Collections
                    </Title>
                    <Text color="dimmed" mb="lg">
                        Browse all anime collections with their chains and
                        related entries.
                    </Text>

                    <CollectionFilters />

                    <Box>
                        {isLoading ? (
                            <CollectionLoader />
                        ) : (
                            <AnimeCollectionTable
                                collections={collections.data}
                            />
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
