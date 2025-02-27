import { Box, Text } from "@mantine/core";
import { AnimeRelatedEntry } from "../types/animeCollections";
import { formatPosterUrl } from "../utils/animeUtils";
import classes from "../AnimeCollectionTable.module.css";

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
    ];

    return { columns };
}
