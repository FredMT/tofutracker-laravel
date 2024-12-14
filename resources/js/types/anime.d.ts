export interface Main {
    tmdbData: TmdbData;
    anidbData: AnidbData;
    collection_name: string;
    type: "animemovie" | "animetv";
}

export interface AnidbData {
    other_related_ids: OtherRelatedID[];
    prequel_sequel_chains: Array<OtherRelatedID[]>;
    characters: Character[];
}

export interface Character {
    id: number;
    name: string;
    character_type: CharacterType;
    picture: string;
    rating: string;
    rating_votes: number;
    seiyuus: Seiyuu[];
}

export enum CharacterType {
    AppearsIn = "appears in",
    MainCharacterIn = "main character in",
    SecondaryCastIn = "secondary cast in",
}

export interface Seiyuu {
    id: number;
    name: string;
    picture: string;
}

export interface OtherRelatedID {
    id: number;
    type: string;
    episode_count: number;
    startdate: Date;
    enddate: Date | null;
    title_main: string;
    homepage: null | string;
    description: string;
    rating: string;
    rating_count: number;
    picture: string;
}

export interface TmdbData {
    data: ShowData | MovieData;
    etag: string;
}

interface BaseData {
    adult: boolean;
    poster_path: string;
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
    recommendations: Recommendations;
    videos: Videos;
    content_rating: string;
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

interface BaseRecommendationResult {
    backdrop_path: string;
    id: number;
    overview: string;
    poster_path: string;
    adult: boolean;
    original_language: OriginalLanguage;
    genre_ids: number[];
    popularity: number;
    vote_average: number;
    vote_count: number;
}

export interface ShowRecommendationResult extends BaseRecommendationResult {
    media_type: MediaType.Tv;
    name: string;
    original_name: string;
    first_air_date: Date;
    origin_country: OriginCountry[];
}

export interface MovieRecommendationResult extends BaseRecommendationResult {
    media_type: MediaType.Movie;
    title: string;
    original_title: string;
    release_date: Date;
    video: boolean;
}

export interface Recommendations {
    page: number;
    results: (ShowRecommendationResult | MovieRecommendationResult)[];
    total_pages: number;
    total_results: number;
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
