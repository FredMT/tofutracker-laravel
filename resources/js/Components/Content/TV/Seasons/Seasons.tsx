import { useAnimeContent } from "@/hooks/useAnimeContent";
import { usePage } from "@inertiajs/react";
import AnimeSeasons from "./AnimeSeasons";
import RegularSeasons from "./RegularSeasons";

interface SeasonsProps {
    containerWidth: number;
    slideSize?: string;
}

export default function Seasons({
    containerWidth,
    slideSize = "0%",
}: SeasonsProps) {
    const animeContent = useAnimeContent();

    const type = usePage().props.type;

    if (type === "tv") {
        return (
            <RegularSeasons
                containerWidth={containerWidth}
                slideSize={slideSize}
            />
        );
    }

    if (type === "animetv") {
        if (!animeContent) return null;
        const hasRelatedContent =
            animeContent.anidbData.other_related_ids.length > 0;
        const hasPrequelSequels =
            Object.keys(animeContent.anidbData.prequel_sequel_chains).length >
            0;

        if (hasRelatedContent || hasPrequelSequels) {
            return (
                <AnimeSeasons
                    containerWidth={containerWidth}
                    slideSize={slideSize}
                />
            );
        }
    }

    return null;
}
