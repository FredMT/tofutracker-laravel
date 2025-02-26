import { Movie, TvShow, TvSeason } from "@/types";
import { Anime } from "@/types/anime";
import { AnimeSeason } from "@/types/animeseason";
import { PageProps as InertiaPageProps } from "@inertiajs/core";

export type ContentType =
    | "movie"
    | "tv"
    | "tv.season"
    | "anime.movie"
    | "anime.tv"
    | "anime.season";

export type RouteMap = {
    [key in ContentType]: string;
};

// Define a union type for all possible content data types
export type ContentData = Movie | TvShow | TvSeason | Anime | AnimeSeason;

// Define the page props interface
export interface LibraryPageProps extends InertiaPageProps {
    type: string;
    data: ContentData;
    [key: string]: any;
}

// Type for the useRemoveFromLibrary hook parameters
export type RemoveFromLibraryParams = {
    routeName: string;
    formData: Record<string, any>;
    itemName?: string;
};
