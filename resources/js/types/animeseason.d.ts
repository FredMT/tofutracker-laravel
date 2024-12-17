import { Episode } from "@/types";
import { BaseCharacter } from "@/types/anime";

export interface AnimeSeason {
    id: number;
    type: string;
    episode_count: number;
    startdate: string;
    enddate: string;
    title_main: string;
    total_runtime: string;
    title_en: string;
    title_ja: string;
    title_ko: string;
    title_zh: string;
    homepage: string;
    description: string;
    rating: string;
    rating_count: number;
    picture: string;
    backdrop_path: string;
    logo_path: string;
    mapped_episodes: MappedEpisodes;
    related_anime: RelatedAnime[];
    similar_anime: SimilarAnime[];
    creators: Creator[];
    external_links: ExternalLink[];
    videos: Video[];
    credits: Credits;
}

export interface Creator {
    creator_id: number;
    name: string;
    role: string;
}

export interface Credits {
    cast: Cast[];
    seiyuu: Cast[];
}

export interface Cast extends BaseCharacter {
    seiyuu?: string;
    characters?: string;
}
export interface ExternalLink {
    type: string;
    identifier: number | string;
}

export interface MappedEpisodes {
    mainEpisodes: { [key: string]: Episode };
    specialEpisodes: { [key: string]: Episode };
}

export interface MainEpisode {
    season: number;
    episode: number;
    id: number;
    name: string;
    aired: string;
    runtime: number;
    overview: string;
    image: string;
    absolute_number: number;
}

export interface RelatedAnime {
    id: number;
    map_id: number;
    name: string;
    picture: string;
    related_anime_id: number;
    relation_type: string;
}

export interface SimilarAnime {
    id: number;
    map_id: number;
    picture: string;
    name: string;
    similar_anime_id: number;
}

export interface Video {
    id: number;
    url: string;
    type: string;
}
