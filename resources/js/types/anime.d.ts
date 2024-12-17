export interface Anime {
    tmdbData: TmdbData;
    anidbData: AnidbData;
    collection_name: string;
}

export interface BaseCharacter {
    id: number;
    name: string;
    picture: string;
}

export interface CastMember extends BaseCharacter {
    seiyuu: string;
}

export interface SeiyuuMember extends BaseCharacter {
    characters: string;
}

export interface AnidbData {
    other_related_ids: RelatedAnimeData[];
    prequel_sequel_chains: Record<string, RelatedAnimeData[]>;
    credits: Credits;
}

export interface RelatedAnimeData {
    id: number;
    map_id: number;
    type: string;
    episode_count: number;
    season: string | null;
    title: string;
    rating: string | null;
    picture: string;
}

export interface Credits {
    cast: CastMember[];
    seiyuu: SeiyuuMember[];
}

export interface CastMember {
    id: number;
    name: string;
    picture: string;
    seiyuu: string;
}

export interface SeiyuuMember {
    id: number;
    name: string;
    picture: string;
    characters: string;
}

export interface TmdbData {
    data: ShowData | MovieData;
    etag: string;
}

interface BaseData {
    adult: boolean;
    poster_path: string;
    title: string;
    logo_path: string;
    backdrop_path: string;
    genres: Genre[];
    homepage: string;
    id: number;
    original_language: OriginalLanguage;
    overview: string;
    popularity: number;
    production_companies: Network[];
    production_countries: ProductionCountry[];
    spoken_languages: SpokenLanguage[];
    status: string;
    tagline: string;
    vote_average: number;
    vote_count: number;
    recommendations: AnimeRecommendation[];
    videos: Videos;
    certification: string;
}

export interface ShowData extends BaseData {
    media_type: MediaType.Tv;
    created_by: any[];
    episode_run_time: number[];
    first_air_date: Date;
    in_production: boolean;
    languages: OriginalLanguage[];
    last_air_date: Date;
    last_episode_to_air: TEpisodeToAir;
    next_episode_to_air: TEpisodeToAir;
    networks: Network[];
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: OriginCountry[];
    original_name: string;
    type: string;
}

export interface MovieData extends BaseData {
    media_type: MediaType.Movie;
    belongs_to_collection: null;
    budget: number;
    imdb_id: string;
    original_title: string;
    release_date: Date;
    revenue: number;
    runtime: number;
    video: boolean;
    year: string;
}

export enum MediaType {
    Tv = "tv",
    Movie = "movie",
}

export enum OriginalLanguage {
    En = "en",
    Ja = "ja",
    Ko = "ko",
    Zh = "zh",
}

export interface Genre {
    id: number;
    name: string;
}

export interface TEpisodeToAir {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: Date;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: null | string;
}

export interface Network {
    id: number;
    logo_path: string;
    name: string;
    origin_country: OriginCountry;
}

export enum OriginCountry {
    Jp = "JP",
    Us = "US",
}

export interface ProductionCountry {
    iso_3166_1: OriginCountry;
    name: string;
}

export interface AnimeRecommendation {
    map_id: number;
    poster_path: string;
    vote_average: number;
    collection_name: string;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1: OriginalLanguage;
    name: string;
}

export interface Videos {
    results: VideosResult[];
}

export interface VideosResult {
    iso_639_1: OriginalLanguage;
    iso_3166_1: OriginCountry;
    name: string;
    key: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: Date;
    id: string;
}
