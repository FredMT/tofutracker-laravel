import { Box, Text } from "@mantine/core";
import { AnimeCollectionEntry } from "../types/animeCollections";
import { formatPosterUrl } from "../utils/animeUtils";
import classes from "../AnimeCollectionTable.module.css";
import { ActionButtons } from "./ActionButtons";

/**
 * Component to render a single anime entry row
 */
export function EntryRow() {
    // Define columns for the anime entries
    const columns = [
        {
            accessor: "title",
            title: "Anime",
            render: ({
                title,
                anidb_poster,
                entry_id,
                entry_sequence_order,
            }: AnimeCollectionEntry) => (
                <Box ml={40} className={classes.titleCell}>
                    <img
                        src={formatPosterUrl(anidb_poster, false)}
                        alt={title}
                        className={classes.poster}
                    />
                    <Text>
                        {title}
                        <Text span c="dimmed">
                            {` id: ${entry_id} - order: ${entry_sequence_order}`}
                        </Text>
                    </Text>
                </Box>
            ),
        },
        {
            accessor: "actions",
            title: "Actions",
            width: 150,
            render: ({ anime_id, map_id }: AnimeCollectionEntry) => (
                <ActionButtons
                    visitUrl={`/anime/${map_id}/season/${anime_id}`}
                    itemId={anime_id}
                    itemType="entry"
                />
            ),
        },
    ];

    return { columns };
}
