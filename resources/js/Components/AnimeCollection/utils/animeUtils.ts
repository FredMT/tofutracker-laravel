/**
 * Utility functions for anime collections
 */
import { AnimeCollection } from "../types/animeCollections";

/**
 * Format the poster URL based on source (TMDB or AniDB)
 */
export const formatPosterUrl = (
    posterPath: string | null,
    isTmdb: boolean
): string => {
    if (!posterPath) return "/img/placeholder-poster.jpg";
    return isTmdb
        ? `https://image.tmdb.org/t/p/w92${posterPath}`
        : `https://anidb.net/images/main/${posterPath}`;
};

/**
 * Calculate total entries count for a collection
 */
export const getTotalEntriesCount = (collection: AnimeCollection): number => {
    const chainEntries = collection.chains.reduce(
        (sum, chain) => sum + chain.entries.length,
        0
    );
    return chainEntries + collection.related_entries.length;
};
