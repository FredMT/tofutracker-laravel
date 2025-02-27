import { Text } from "@mantine/core";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { AnimeCollection } from "../types/animeCollections";
import { formatPosterUrl, getTotalEntriesCount } from "../utils/animeUtils";
import classes from "../AnimeCollectionTable.module.css";
import { ActionButtons } from "./ActionButtons";

interface CollectionRowProps {
    expandedCollectionIds: number[];
}

/**
 * Component to define the collection row columns
 */
export function CollectionRow({ expandedCollectionIds }: CollectionRowProps) {
    // Define columns for the collections
    const columns = [
        {
            accessor: "title",
            title: "Collection / Chain / Entry",
            render: ({
                id,
                title,
                tmdb_poster,
                most_common_tmdb_id,
            }: AnimeCollection) => (
                <div className={classes.titleCell}>
                    <ChevronRight
                        className={clsx(classes.icon, classes.expandIcon, {
                            [classes.expandIconRotated]:
                                expandedCollectionIds.includes(id),
                        })}
                    />
                    {tmdb_poster && (
                        <img
                            src={formatPosterUrl(tmdb_poster, true)}
                            alt={title || "Collection"}
                            className={classes.poster}
                        />
                    )}
                    <Text fw={700}>
                        {title || "Unnamed Collection"}
                        <Text span c="dimmed">
                            {` id: ${id} `}
                            {most_common_tmdb_id && (
                                <Text span c="dimmed">
                                    {`- tmdb_id: ${most_common_tmdb_id}`}
                                </Text>
                            )}
                        </Text>
                    </Text>
                </div>
            ),
        },
        {
            accessor: "tmdb_type",
            title: "Type",
            width: 100,
            render: ({ tmdb_type }: AnimeCollection) => (
                <Text>{tmdb_type ? tmdb_type.toUpperCase() : "N/A"}</Text>
            ),
        },
        {
            accessor: "entries",
            title: "Entries",
            textAlign: "right" as const,
            width: 100,
            render: (collection: AnimeCollection) =>
                getTotalEntriesCount(collection),
        },
        {
            accessor: "actions",
            title: "Actions",
            width: 150,
            render: ({ id }: AnimeCollection) => (
                <ActionButtons
                    visitUrl={`/anime/${id}`}
                    onSuggestions={() =>
                        console.log(`Suggestions for collection ${id}`)
                    }
                    onLock={() => console.log(`Lock collection ${id}`)}
                    onEdit={() => console.log(`Edit collection ${id}`)}
                />
            ),
        },
    ];

    return { columns };
}
