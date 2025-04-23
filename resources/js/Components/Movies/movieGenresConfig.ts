import {
	Camera,
	Compass,
	Drama,
	Flag,
	Ghost,
	Heart,
	Home,
	Laugh,
	Music,
	Play,
	Rocket,
	Scroll,
	Search,
	Shield,
	Skull,
	Swords,
	Target,
	Tv,
	Wand,
} from 'lucide-react';
import React from 'react';

export type GenreConfig = {
	id: number;
	IconComponent: React.ComponentType<any>;
	color: string;
	background: string;
	image: string;
	description: string;
};

// Normalize function to handle genre names consistently
export const normalizeGenreName = (name: string): string => {
	return name
		.toLowerCase()
		.replace(/\s+|-|\(|\)|&/g, '') // Remove spaces, hyphens, parentheses, ampersands
		.replace('sci-fi', 'scifi') // Specific replacement
		.replace('science fiction', 'sciencefiction');
};

// Movie genre descriptions
const movieGenreDescriptions = {
	action:
		'High-energy films with physical feats, chases, fights, and stunts, where conflict is usually resolved through force.',
	adventure:
		'Stories that take characters on journeys beyond the ordinary world, often featuring quests, explorations, and discoveries.',
	animation:
		'Films created through various animation techniques, appealing to audiences of all ages with imaginative visuals.',
	comedy:
		'Movies designed to make audiences laugh through humor, jokes, and amusing situations.',
	crime:
		'Stories centered around criminal activities, investigations, or the criminal justice system.',
	documentary:
		'Non-fiction films that document reality, often for education, historical record, or revealing insights.',
	drama:
		'Character-driven narratives focusing on realistic themes, emotional depth, and interpersonal conflicts.',
	family:
		'Films suitable for viewers of all ages, often emphasizing themes of togetherness and moral lessons.',
	fantasy:
		'Stories set in imaginary worlds with magical elements, mythical creatures, and supernatural phenomena.',
	history:
		'Films based on historical events, periods, or figures, often balancing entertainment with educational value.',
	horror:
		'Movies designed to frighten, shock, and evoke fear through suspense, gore, or supernatural elements.',
	music:
		'Films celebrating musical performance, featuring soundtracks integral to the storytelling.',
	mystery:
		'Stories centered around solving puzzles, crimes, or unexplained phenomena, keeping audiences guessing.',
	romance:
		'Tales focusing on romantic relationships, often following the development of love between characters.',
	sciencefiction:
		'Stories exploring advanced technologies, space travel, time travel, extraterrestrial life, and scientific concepts.',
	thriller:
		'Films designed to evoke excitement, suspense, and anticipation, keeping audiences on the edge of their seats.',
	war: 'Movies depicting warfare, military conflicts, and their impact on societies and individuals.',
	western:
		'Stories set primarily in the American Old West during the late 19th century, featuring cowboys, outlaws, and frontier life.',
	default: 'A diverse collection of films spanning various genres and styles.',
};

// Configuration object for Movie Genres
export const movieGenresConfig: Record<string, GenreConfig> = {
	// Based on TMDB genre IDs
	action: {
		id: 28,
		IconComponent: Swords,
		color: 'var(--mantine-color-red-5)',
		background: 'var(--mantine-color-red-9)',
		image: '/movie_genre_images/action-bg.webp',
		description: movieGenreDescriptions.action,
	},
	adventure: {
		id: 12,
		IconComponent: Compass,
		color: 'var(--mantine-color-orange-5)',
		background: 'var(--mantine-color-orange-9)',
		image: '/movie_genre_images/adventure-bg.webp',
		description: movieGenreDescriptions.adventure,
	},
	animation: {
		id: 16,
		IconComponent: Play,
		color: 'var(--mantine-color-blue-5)',
		background: 'var(--mantine-color-blue-9)',
		image: '/movie_genre_images/animation-bg.webp',
		description: movieGenreDescriptions.animation,
	},
	comedy: {
		id: 35,
		IconComponent: Laugh,
		color: 'var(--mantine-color-pink-5)',
		background: 'var(--mantine-color-pink-9)',
		image: '/movie_genre_images/comedy-bg.webp',
		description: movieGenreDescriptions.comedy,
	},
	crime: {
		id: 80,
		IconComponent: Skull,
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-dark-8)',
		image: '/movie_genre_images/crime-bg.webp',
		description: movieGenreDescriptions.crime,
	},
	documentary: {
		id: 99,
		IconComponent: Camera,
		color: 'var(--mantine-color-cyan-5)',
		background: 'var(--mantine-color-cyan-9)',
		image: '/movie_genre_images/documentary-bg.webp',
		description: movieGenreDescriptions.documentary,
	},
	drama: {
		id: 18,
		IconComponent: Drama,
		color: 'var(--mantine-color-grape-5)',
		background: 'var(--mantine-color-grape-9)',
		image: '/movie_genre_images/drama-bg.webp',
		description: movieGenreDescriptions.drama,
	},
	family: {
		id: 10751,
		IconComponent: Home,
		color: 'var(--mantine-color-lime-5)',
		background: 'var(--mantine-color-lime-9)',
		image: '/movie_genre_images/family-bg.webp',
		description: movieGenreDescriptions.family,
	},
	fantasy: {
		id: 14,
		IconComponent: Wand,
		color: 'var(--mantine-color-indigo-5)',
		background: 'var(--mantine-color-indigo-9)',
		image: '/movie_genre_images/fantasy-bg.webp',
		description: movieGenreDescriptions.fantasy,
	},
	history: {
		id: 36,
		IconComponent: Scroll,
		color: 'var(--mantine-color-orange-6)',
		background: 'var(--mantine-color-orange-9)',
		image: '/movie_genre_images/history-bg.webp',
		description: movieGenreDescriptions.history,
	},
	horror: {
		id: 27,
		IconComponent: Ghost,
		color: 'var(--mantine-color-dark-3)',
		background: 'var(--mantine-color-dark-8)',
		image: '/movie_genre_images/horror-bg.webp',
		description: movieGenreDescriptions.horror,
	},
	music: {
		id: 10402,
		IconComponent: Music,
		color: 'var(--mantine-color-grape-4)',
		background: 'var(--mantine-color-grape-8)',
		image: '/movie_genre_images/music-bg.webp',
		description: movieGenreDescriptions.music,
	},
	mystery: {
		id: 9648,
		IconComponent: Search,
		color: 'var(--mantine-color-purple-5)',
		background: 'var(--mantine-color-purple-9)',
		image: '/movie_genre_images/mystery-bg.webp',
		description: movieGenreDescriptions.mystery,
	},
	romance: {
		id: 10749,
		IconComponent: Heart,
		color: 'var(--mantine-color-pink-4)',
		background: 'var(--mantine-color-pink-8)',
		image: '/movie_genre_images/romance-bg.webp',
		description: movieGenreDescriptions.romance,
	},
	sciencefiction: {
		id: 878,
		IconComponent: Rocket,
		color: 'var(--mantine-color-blue-5)',
		background: 'var(--mantine-color-blue-9)',
		image: '/movie_genre_images/sciencefiction-bg.webp',
		description: movieGenreDescriptions.sciencefiction,
	},
	thriller: {
		id: 53,
		IconComponent: Target,
		color: 'var(--mantine-color-red-6)',
		background: 'var(--mantine-color-dark-7)',
		image: '/movie_genre_images/thriller-bg.webp',
		description: movieGenreDescriptions.thriller,
	},
	war: {
		id: 10752,
		IconComponent: Shield,
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-dark-7)',
		image: '/movie_genre_images/war-bg.webp',
		description: movieGenreDescriptions.war,
	},
	western: {
		id: 37,
		IconComponent: Flag,
		color: 'var(--mantine-color-orange-5)',
		background: 'var(--mantine-color-brown-9)',
		image: '/movie_genre_images/western-bg.webp',
		description: movieGenreDescriptions.western,
	},

	// Default Fallback
	default: {
		id: 0,
		IconComponent: Tv,
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-dark-8)',
		image: '/movie_genre_images/default-bg.webp',
		description: movieGenreDescriptions.default,
	},
};

// Function to retrieve config, falling back to default
export const getMovieGenreConfig = (genreName: string): GenreConfig => {
	// Handle potential variations like "Sci-Fi" vs "scifi"
	const normalizedKey = normalizeGenreName(genreName);

	let config = movieGenresConfig[normalizedKey];

	// Optional: Add a fallback for the original non-normalized name if needed
	if (!config) {
		config = movieGenresConfig[genreName.toLowerCase()];
	}

	return config || movieGenresConfig.default;
};
