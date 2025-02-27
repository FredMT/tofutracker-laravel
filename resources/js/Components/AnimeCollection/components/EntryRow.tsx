import { Box, Text } from "@mantine/core";
import { AnimeCollectionEntry } from "../types/animeCollections";
import { formatPosterUrl } from "../utils/animeUtils";
import { AnimeMetaInfo } from "./AnimeMetaInfo";
import classes from "../AnimeCollectionTable.module.css";

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
            accessor: "metaInfo",
            title: "Information",
            render: ({
                year,
                rating,
                episode_count,
                runtime,
            }: AnimeCollectionEntry) => (
                <AnimeMetaInfo
                    year={year}
                    rating={rating}
                    episode_count={episode_count}
                    runtime={runtime}
                />
            ),
        },
        {
            accessor: "entry_sequence_order",
            title: "Order",
            width: 70,
            textAlign: "center" as const,
        },
    ];

    return { columns };
}
