import { Box, Text } from "@mantine/core";
import { AnimeRelatedEntry } from "../types/animeCollections";
import { formatPosterUrl } from "../utils/animeUtils";
import classes from "../AnimeCollectionTable.module.css";
import { ActionButtons } from "./ActionButtons";

/**
 * Component to define columns for related entries
 */
export function RelatedEntryRow() {
    // Define columns for the related entries
    const columns = [
        {
            accessor: "title",
            title: "Anime",
            render: ({
                title,
                anidb_poster,
                related_entry_id,
            }: AnimeRelatedEntry) => (
                <Box ml={20} className={classes.titleCell}>
                    <img
                        src={formatPosterUrl(anidb_poster, false)}
                        alt={title}
                        className={classes.poster}
                    />
                    <Text>
                        {title}
                        <Text span c="dimmed">
                            {` id: ${related_entry_id}`}
                        </Text>
                    </Text>
                </Box>
            ),
        },
        {
            accessor: "actions",
            title: "Actions",
            width: 150,
            render: ({ anime_id, map_id }: AnimeRelatedEntry) => (
                <ActionButtons
                    visitUrl={`/anime/${map_id}/season/${anime_id}`}
                    itemId={anime_id}
                    itemType="related"
                />
            ),
        },
    ];

    return { columns };
}
