import { Badge, Text, Loader, Group } from "@mantine/core";
import styles from "./LibraryGrid.module.css";
import { LibraryEntry } from "@/types";

interface LibraryGridProps {
    entries: LibraryEntry[];
    isLoading: boolean;
    hasMore: boolean;
    infiniteScrollRef: (node: Element | null) => void;
}

export function LibraryGrid({
    entries,
    isLoading,
    hasMore,
    infiniteScrollRef,
}: LibraryGridProps) {
    return (
        <>
            <div className={styles.movieGrid}>
                {entries.map((entry) => (
                    <div key={entry.id} className={styles.movieCard}>
                        {entry.movie_data?.poster_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w500${entry.movie_data.poster_path}`}
                                alt={entry.movie_data.title}
                                className={styles.moviePoster}
                            />
                        )}
                        <div className={styles.movieInfo}>
                            <Text size="sm" fw={500} lineClamp={1}>
                                {entry.movie_data?.title}
                            </Text>
                            <Group gap={8} mt={4}>
                                <Badge size="sm" variant="filled">
                                    {entry.status}
                                </Badge>
                                {entry.rating && (
                                    <Badge size="sm" variant="outline">
                                        {entry.rating}/10
                                    </Badge>
                                )}
                            </Group>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div
                    ref={infiniteScrollRef}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "20px",
                    }}
                >
                    {isLoading ? (
                        <Loader size="sm" />
                    ) : (
                        <Text size="sm" c="dimmed">
                            Scroll for more
                        </Text>
                    )}
                </div>
            )}
        </>
    );
}
