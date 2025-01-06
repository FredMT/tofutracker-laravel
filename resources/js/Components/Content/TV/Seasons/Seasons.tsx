import { useAnimeContent } from "@/hooks/useAnimeContent";
import { usePage } from "@inertiajs/react";
import AnimeSeasons from "./AnimeSeasons";
import RegularSeasons from "./RegularSeasons";
import {AnimeContentDataType, ContentType} from "@/types";
import {Anime} from "@/types/anime";

interface SeasonsProps {
    containerWidth: number;
    slideSize?: string;
}

export default function Seasons({
    containerWidth,
    slideSize = "0%",
}: SeasonsProps) {

    const {type} = usePage<{type: ContentType}>().props;

    if (type === "tv") {
        return (
            <RegularSeasons
                containerWidth={containerWidth}
                slideSize={slideSize}
            />
        );
    }

    if (type === "animetv") {
            return (
                <AnimeSeasons
                    containerWidth={containerWidth}
                    slideSize={slideSize}
                />
            );
        }
}
