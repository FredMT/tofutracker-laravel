export type UserCustomLists =
	| {
	id: number;
	title: string;
	description: string | null;
	banner_image: string | null;
	banner_type: "custom" | "tmdb";
	created_at: string;
	updated_at: string | null;
	is_public: boolean;
	private_note?: string | null;
	counts: Counts;
	posters: Poster[] | null;
}[]
	| null;

export type UserCustomList = {
	id: number;
	title: string;
	description: string | null;
	banner_image: string | null;
	banner_type: "custom" | "tmdb";
	created_at: string;
	updated_at: string | null;
	is_public: boolean;
	private_note?: string | null;
	counts: Counts;
	posters: Poster[] | null;
};

type Counts = {
	total: number;
	movies: number;
	tv: number;
	anime: number;
};

export type Poster = { poster_path: string; poster_type: string };
