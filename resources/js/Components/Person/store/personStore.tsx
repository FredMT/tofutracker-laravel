import {
	calculateAge,
	calculateBayesianRating,
	Credit,
	ExternalIds,
	formatDate,
} from '@/Components/Person/PersonUtils';
import {
	PersonMovieCast,
	PersonMovieCrew,
	PersonTvCast,
	PersonTvCrew,
} from '@/propsHooks/usePersonCredits';
import { createContext, useContext, useRef } from 'react';
import { createStore } from 'zustand';
import { shallow } from 'zustand/shallow';
import { useStoreWithEqualityFn } from 'zustand/traditional';

interface PersonProps {
	person: {
		id: number;
		name: string;
		profile_path: string | null;
		biography: string | null;
		birthday: string | null;
		place_of_birth: string | null;
		gender: number | null;
		known_for_department: string | null;
	};
	movie_cast: PersonMovieCast[];
	movie_crew: PersonMovieCrew[];
	tv_cast: PersonTvCast[];
	tv_crew: PersonTvCrew[];
	external_ids: ExternalIds;
}

// Define the state interface that extends the props and includes actions
interface PersonState extends PersonProps {
	// UI state
	activeTab: string | null;

	// Computed values
	knownFor: Credit[];
	randomMediaDetails: {
		backdrop_path: string;
		title: string;
		character: string;
		mediaType: 'movie' | 'tv';
	} | null;

	// Counts
	uniqueMovieCreditsCount: number;
	uniqueTvCreditsCount: number;
	totalCreditsCount: number;

	// Actions
	setActiveTab: (tab: string | null) => void;
	updateComputedValues: () => void;
}

// Define the store type
type PersonStore = ReturnType<typeof createPersonStore>;

// Store creator function that accepts initial props
const createPersonStore = (initProps?: Partial<PersonProps>) => {
	const DEFAULT_PROPS: PersonProps = {
		person: {
			id: 0,
			name: '',
			profile_path: null,
			biography: null,
			birthday: null,
			place_of_birth: null,
			gender: null,
			known_for_department: null,
		},
		movie_cast: [],
		movie_crew: [],
		tv_cast: [],
		tv_crew: [],
		external_ids: {
			imdb_id: null,
			instagram_id: null,
			twitter_id: null,
		},
	};

	return createStore<PersonState>()((set, get) => ({
		// Initialize with default props and any provided props
		...DEFAULT_PROPS,
		...initProps,

		// UI state with defaults
		activeTab: 'overview',

		// Initialize computed values
		knownFor: [],
		randomMediaDetails: null,
		uniqueMovieCreditsCount: 0,
		uniqueTvCreditsCount: 0,
		totalCreditsCount: 0,

		// Actions
		setActiveTab: (tab) => set({ activeTab: tab }),

		// Function to recalculate all computed values
		updateComputedValues: () => {
			const state = get();
			const { movie_cast, movie_crew, tv_cast, tv_crew } = state;

			// Calculate counts
			const uniqueMovieCreditsCount = movie_cast.length + movie_crew.length;
			const uniqueTvCreditsCount = tv_cast.length + tv_crew.length;
			const totalCreditsCount = uniqueMovieCreditsCount + uniqueTvCreditsCount;

			// Calculate known for credits
			const topMovies = movie_cast
				.map((credit) => ({
					...credit,
					mediaType: 'movie' as const,
					bayesianRating: calculateBayesianRating(
						credit.rating,
						credit.vote_count
					),
				}))
				.sort((a, b) => b.bayesianRating - a.bayesianRating)
				.slice(0, 5);

			const topTvShows = tv_cast
				.map((credit) => ({
					...credit,
					mediaType: 'tv' as const,
					bayesianRating: calculateBayesianRating(
						credit.rating,
						credit.vote_count
					),
				}))
				.sort((a, b) => b.bayesianRating - a.bayesianRating)
				.slice(0, 5);

			const knownFor = [...topMovies, ...topTvShows]
				.sort((a, b) => b.bayesianRating - a.bayesianRating)
				.slice(0, 10);

			// Select random backdrop
			const movieBackdrops = movie_cast
				.filter((movie) => movie.backdrop_path)
				.map((movie) => ({
					backdrop_path: movie.backdrop_path as string,
					title: movie.title,
					character: movie.character,
					mediaType: 'movie' as const,
				}));

			const tvBackdrops = tv_cast
				.filter((show) => show.backdrop_path)
				.map((show) => ({
					backdrop_path: show.backdrop_path as string,
					title: show.title,
					character: show.character,
					mediaType: 'tv' as const,
				}));

			const allBackdrops = [...movieBackdrops, ...tvBackdrops];
			const randomMediaDetails =
				allBackdrops.length === 0
					? null
					: allBackdrops[Math.floor(Math.random() * allBackdrops.length)];

			// Update state with computed values
			set({
				uniqueMovieCreditsCount,
				uniqueTvCreditsCount,
				totalCreditsCount,
				knownFor,
				randomMediaDetails,
			});
		},
	}));
};

// Create the React context
export const PersonContext = createContext<PersonStore | null>(null);

// Define a provider component to wrap the app
interface PersonProviderProps
	extends React.PropsWithChildren<Partial<PersonProps>> {}

export function PersonProvider({ children, ...props }: PersonProviderProps) {
	// Create the store only once using useRef
	const storeRef = useRef<PersonStore>();
	if (!storeRef.current) {
		storeRef.current = createPersonStore(props);
	}

	return (
		<PersonContext.Provider value={storeRef.current}>
			{children}
		</PersonContext.Provider>
	);
}

// Custom hook for consuming the context
export function usePersonContext<T>(selector: (state: PersonState) => T): T {
	const store = useContext(PersonContext);
	if (!store) throw new Error('Missing PersonContext.Provider in the tree');
	// Use shallow equality by default to prevent unnecessary rerenders
	return useStoreWithEqualityFn(store, selector, shallow);
}

// For custom equality function
// Helper selectors for common derived data
export const usePersonAge = () => {
	return usePersonContext((state) => {
		const birthday = state.person.birthday;
		return calculateAge(birthday ?? '');
	});
};

export const useFormattedBirthday = () => {
	return usePersonContext((state) => {
		const birthday = state.person.birthday;
		return formatDate(birthday ?? '');
	});
};

export const useHasCredits = () => {
	// Use a single selector that returns a memoized object
	return usePersonContext((state) => {
		return {
			hasMovieCredits:
				state.movie_cast.length > 0 || state.movie_crew.length > 0,
			hasTvCredits: state.tv_cast.length > 0 || state.tv_crew.length > 0,
		};
	});
};
