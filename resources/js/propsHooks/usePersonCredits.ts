import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

export type PersonMovieCast = {
	backdrop_path: string | null;
	character: string;
	id: number;
	poster_path: string | null;
	year: string;
	title: string;
	popularity: number;
	rating: number;
	vote_count: number;
	priority: number;
};

export type PersonTvCrew = {
	backdrop_path: string | null;
	department: string;
	job: string;
	id: number;
	poster_path: string | null;
	year: string;
	title: string;
	popularity: number;
	rating: number;
	vote_count: number;
	priority: number;
};

export type PersonTvCast = {
	backdrop_path: string | null;
	character: string;
	id: number;
	poster_path: string | null;
	year: string;
	title: string;
	popularity: number;
	rating: number;
	vote_count: number;
	priority: number;
};

export type PersonMovieCrew = {
	backdrop_path: string | null;
	department: string;
	job: string;
	id: number;
	poster_path: string | null;
	year: string;
	title: string;
	popularity: number;
	rating: number;
	vote_count: number;
	priority: number;
};

export type PersonAnimeCast = {
	backdrop_path: string | null;
	character: string;
	id: number;
	original_id: number;
	poster_path: string | null;
	year: string;
	title: string;
	popularity: number;
	rating: number;
	vote_count: number;
	priority: number;
};

export type PersonAnimeCrew = {
	backdrop_path: string | null;
	department: string;
	job: string;
	id: number;
	original_id: number;
	poster_path: string | null;
	year: string;
	title: string;
	popularity: number;
	rating: number;
	vote_count: number;
	priority: number;
};

type Credits = {
	movie_cast: PersonMovieCast[];
	movie_crew: PersonMovieCrew[];
	tv_cast: PersonTvCast[];
	tv_crew: PersonTvCrew[];
	anime_cast: PersonAnimeCast[];
	anime_crew: PersonAnimeCrew[];
};

export function usePersonCredits() {
	const props = useTypedPageProps();
	const credits = props.credits as unknown as Credits;
	return {
		movie_cast: credits.movie_cast as unknown as PersonMovieCast[],
		movie_crew: credits.movie_crew as unknown as PersonMovieCrew[],
		tv_cast: credits.tv_cast as unknown as PersonTvCast[],
		tv_crew: credits.tv_crew as unknown as PersonTvCrew[],
		anime_cast: credits.anime_cast as unknown as PersonAnimeCast[],
		anime_crew: credits.anime_crew as unknown as PersonAnimeCrew[],
	};
}
