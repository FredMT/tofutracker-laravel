import { AnimeCollection } from "@/types/userAnime";
import { Modal, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AnimeSeasonTable from "./AnimeSeasonTable";
import AnimeSeasonVerticalTable from "./AnimeSeasonVerticalTable";

interface AnimeSeasonModalProps {
    collection: AnimeCollection;
    opened: boolean;
    onClose: () => void;
}

export function AnimeSeasonModal({
    collection,
    opened,
    onClose,
}: AnimeSeasonModalProps) {
    const isDesktop = useMediaQuery("(min-width: 40em)");
    const isMovie = !!collection.movies?.length;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`${collection.title} ${isMovie ? "Details" : "Seasons"}`}
            size="xl"
            centered
        >
            {isDesktop ? (
                <Stack gap="md">
                    {isMovie ? (
                        <AnimeSeasonTable entries={collection.movies} isMovie />
                    ) : (
                        collection.seasons?.map((season) => (
                            <div key={season.chain_id}>
                                <AnimeSeasonTable
                                    entries={season.entries}
                                    chainName={season.name}
                                    collectionId={collection.id}
                                />
                            </div>
                        ))
                    )}
                </Stack>
            ) : (
                <Stack gap="md">
                    {isMovie ? (
                        <AnimeSeasonVerticalTable
                            entries={collection.movies}
                            isMovie
                        />
                    ) : (
                        collection.seasons?.map((season) => (
                            <div key={season.chain_id}>
                                <AnimeSeasonVerticalTable
                                    entries={season.entries}
                                    chainName={season.name}
                                    collectionId={collection.id}
                                />
                            </div>
                        ))
                    )}
                </Stack>
            )}
        </Modal>
    );
}

export default AnimeSeasonModal;
