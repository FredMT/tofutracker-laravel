import { useShowsPageGenres } from "@/propsHooks/useShowsPageGenres";
import { Deferred } from "@inertiajs/react";
import { GenresSkeleton } from "@/Components/Shows/components/GenresSkeleton";
import { GenresCarousels } from "@/Components/Shows/components/GenresCarousels";

export const GenresSection = () => {
    const genres = useShowsPageGenres();

    return (
        <div className="space-y-4">
            <Deferred
                data="genres"
                fallback={<GenresSkeleton />}
            >
                <GenresCarousels genresProp={genres} />
            </Deferred>
        </div>
    );
};
