import { genreDescriptions } from '@/data/genreDescriptions';
import { alpha } from '@mantine/core';
import {
	Activity,
	Atom,
	Baby,
	BookOpen,
	Code,
	Compass,
	Drama,
	Film,
	Ghost,
	HandHeart,
	HeartHandshake,
	HelpCircle,
	Landmark,
	Laugh,
	LucideProps,
	Map,
	MessageCircle,
	Music,
	Scroll,
	Sparkles,
	Sword,
	Users,
	Wand,
} from 'lucide-react';
import React from 'react';

export type GenreConfig = {
	IconComponent: React.ComponentType<LucideProps>;
	color: string;
	background: string;
	image: string;
	description: string;
};

export const normalizeGenreName = (name: string): string => {
	return name.toLowerCase().replace(/\s+|&|-/g, '');
};

export const genresConfig: Record<string, GenreConfig> = {
	action: {
		IconComponent: Activity,
		color: 'var(--mantine-color-red-4)',
		background: 'var(--mantine-color-red-9)',
		image:
			'https://images.unsplash.com/photo-1598387181067-8782c5b0339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.action,
	},
	adventure: {
		IconComponent: Compass,
		color: 'var(--mantine-color-orange-4)',
		background: 'var(--mantine-color-orange-9)',
		image:
			'https://images.unsplash.com/photo-1495063378081-52411c3eedf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.adventure,
	},
	animation: {
		IconComponent: Sparkles,
		color: 'var(--mantine-color-teal-4)',
		background: 'var(--mantine-color-teal-9)',
		image:
			'https://images.unsplash.com/photo-1581337413558-69e5578f1e4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.animation,
	},
	comedy: {
		IconComponent: Laugh,
		color: alpha('var(--mantine-color-pink-4)', 0.9),
		background: alpha('var(--mantine-color-pink-9)', 0.9),
		image: '/genre_images/comedy-bg.webp',
		description: genreDescriptions.comedy,
	},
	crime: {
		IconComponent: Landmark,
		color: 'var(--mantine-color-yellow-4)',
		background: 'var(--mantine-color-yellow-9)',
		image:
			'https://images.unsplash.com/photo-1598618443855-232ee0f819f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.crime,
	},
	documentary: {
		IconComponent: BookOpen,
		color: 'var(--mantine-color-lime-4)',
		background: 'var(--mantine-color-lime-9)',
		image:
			'https://images.unsplash.com/photo-1509099652299-50413539eb15?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.documentary,
	},
	drama: {
		IconComponent: HeartHandshake,
		color: 'var(--mantine-color-violet-4)',
		background: 'var(--mantine-color-violet-9)',
		image:
			'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.drama,
	},
	family: {
		IconComponent: Users,
		color: 'var(--mantine-color-green-4)',
		background: 'var(--mantine-color-green-9)',
		image:
			'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.family,
	},
	fantasydrama: {
		IconComponent: Wand,
		color: alpha('var(--mantine-color-indigo-4)', 0.9),
		background: alpha('var(--mantine-color-indigo-9)', 0.9),
		image: '/genre_images/fantasydrama-bg.webp',
		description: genreDescriptions.fantasy,
	},
	history: {
		IconComponent: Scroll,
		color: 'var(--mantine-color-orange-4)',
		background: 'var(--mantine-color-orange-9)',
		image:
			'https://images.unsplash.com/photo-1455877391166-06664f444297?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.history,
	},
	horror: {
		IconComponent: Ghost,
		color: 'var(--mantine-color-gray-4)',
		background: 'var(--mantine-color-gray-9)',
		image:
			'https://images.unsplash.com/photo-1509248961158-e54f6934749c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.horror,
	},
	music: {
		IconComponent: Music,
		color: 'var(--mantine-color-grape-4)',
		background: 'var(--mantine-color-grape-9)',
		image:
			'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.music,
	},
	mystery: {
		IconComponent: HelpCircle,
		color: 'var(--mantine-color-blue-4)',
		background: 'var(--mantine-color-blue-9)',
		image:
			'https://images.unsplash.com/photo-1568584263125-bf8f0a77d51c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.mystery,
	},
	romance: {
		IconComponent: HandHeart,
		color: 'var(--mantine-color-pink-4)',
		background: 'var(--mantine-color-pink-9)',
		image:
			'https://images.unsplash.com/photo-1505968409348-bd000797c92e?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.romance,
	},

	'sci-fi & fantasy': {
		IconComponent: Wand,
		color: 'var(--mantine-color-cyan-4)',
		background: 'var(--mantine-color-cyan-9)',
		image:
			'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions['science fiction'],
	},
	'science fiction': {
		IconComponent: Atom,
		color: 'var(--mantine-color-cyan-4)',
		background: 'var(--mantine-color-cyan-9)',
		image:
			'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions['science fiction'],
	},
	'action & adventure': {
		IconComponent: Activity,
		color: 'var(--mantine-color-red-4)',
		background: 'var(--mantine-color-red-9)',
		image: '/genre_images/a-bg.webp',
		description: genreDescriptions['action & adventure'],
	},
	thriller: {
		IconComponent: Drama,
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-dark-8)',
		image:
			'https://images.unsplash.com/photo-1505688766716-1a1c104e797d?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.thriller,
	},
	war: {
		IconComponent: Sword,
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-dark-7)',
		image:
			'https://images.unsplash.com/photo-1475258296313-4bd7d693526e?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.war,
	},
	western: {
		IconComponent: Map,
		color: alpha('var(--mantine-color-yellow-4)', 0.9),
		background: alpha('var(--mantine-color-yellow-9)', 0.9),
		image: '/genre_images/western-bg.webp',
		description: genreDescriptions.western,
	},
	cyberpunk: {
		IconComponent: Code,
		color: alpha('var(--mantine-color-grape-4)', 0.9),
		background: alpha('var(--mantine-color-grape-9)', 0.9),
		image: '/genre_images/cyberpunk-bg.webp',
		description: genreDescriptions.cyberpunk,
	},
	kids: {
		IconComponent: Baby,
		color: alpha('var(--mantine-color-blue-4)', 0.9),
		background: alpha('var(--mantine-color-blue-9)', 0.9),
		image: '/genre_images/kids-bg.webp',
		description: genreDescriptions.kids,
	},
	talk: {
		IconComponent: MessageCircle,
		color: alpha('var(--mantine-color-gray-4)', 0.9),
		background: alpha('var(--mantine-color-gray-9)', 0.9),
		image: '/genre_images/talk-bg.webp',
		description: genreDescriptions.talk,
	},
	default: {
		IconComponent: Film,
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-dark-8)',
		image:
			'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
		description: genreDescriptions.default,
	},
};

export const getGenreConfig = (genreName: string): GenreConfig => {
	const normalizedKey = normalizeGenreName(genreName);

	let config = genresConfig[normalizedKey];

	if (!config) {
		config = genresConfig[genreName.toLowerCase()];
	}

	return config || genresConfig.default;
};
