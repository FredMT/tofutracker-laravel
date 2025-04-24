import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

interface PersonMovieCast {
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
}

type PersonTvCrew = {
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

type PersonTvCast = {
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

type PersonMovieCrew = {
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

type Credits = {
	movie_cast: PersonMovieCast[];
	movie_crew: PersonMovieCrew[];
	tv_cast: PersonTvCast[];
	tv_crew: PersonTvCrew[];
};

export function usePersonCredits() {
	const props = useTypedPageProps();
	const credits = props.credits as unknown as Credits;
	return {
		movie_cast: credits.movie_cast as unknown as PersonMovieCast[],
		movie_crew: credits.movie_crew as unknown as PersonMovieCrew[],
		tv_cast: credits.tv_cast as unknown as PersonTvCast[],
		tv_crew: credits.tv_crew as unknown as PersonTvCrew[],
	};
}
