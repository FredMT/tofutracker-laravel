import {
	Activity,
	Atom,
	Baby, // Super Power
	Ban,
	BookOpen,
	Bot, // Mecha
	Brain, // Psychological
	Briefcase, // Workplace, Organized Crime
	Building, // Racing (use Flag for consistency?)
	ChefHat, // Time Travel
	Clapperboard, // Gourmet
	Clock, // Could use for Mecha/Tech
	Compass, // Adventure
	Crown, // Villainess
	Dice3, // High Stakes Game
	DoorOpen, // Gore (use with caution)
	Drama, // Isekai
	Droplet, // Default
	Flag, // Racing
	Flame, // Ecchi
	Gamepad2, // Video Game, Strategy Game
	Ghost, // Horror, Supernatural
	GitMerge, // Love Polygon
	GraduationCap, // School
	HandHeart, // Romance
	Heart, // Boys Love, Girls Love, Erotica, Hentai (use carefully)
	HeartHandshake, // Could use for Romance/Drama variations
	HelpCircle, // Historical
	Home, // Slice of Life
	Hourglass, // Historical alternative
	Laugh, // Comedy, Gag Humor
	Leaf, // Iyashikei alternative
	LucideProps, // Performing Arts
	Medal, // Music, Idols
	Moon, // Vampire
	Mountain, // Survival
	Music, // Music
	Orbit, // Space
	Package, // Otaku Culture
	Paintbrush, // Visual Arts
	PawPrint, // Could use for demographics
	Puzzle, // Strategy Game alternative
	Recycle, // Reincarnation
	Repeat, // Reincarnation alternative
	Rocket, // School alternative
	Scroll, // Historical, Mythology
	Search, // Detective
	Shield, // Military
	Skull, // Delinquents, Gore alternative
	Smile, // CGDCT
	Sparkles, // Fantasy, Mahou Shoujo, CGDCT alternative
	Star, // Idols
	Stethoscope, // Medical
	Swords, // Performing Arts alternative
	Trophy, // Award Winning, Sports
	Tv, // Default alternative
	User, // Josei, Seinen (base)
	UserCheck, // Martial Arts
	UserCog, // Shoujo specific?
	UserRound, // Shounen specific?
	Users, // Adventure alternative
	VenetianMask, // Gourmet alternative
	Wand, // Fantasy, Magical Sex Shift, Mahou Shoujo
	Zap,
} from 'lucide-react';
import React from 'react';
import { animeGenreDescriptions } from '../Shows/components/animeGenreDescriptions';

export type GenreConfig = {
	id: number;
	IconComponent: React.ComponentType<LucideProps>;
	color: string;
	background: string;
	image: string; // Consider local paths: /anime_genre_images/[genre]-bg.webp
	description: string;
};

// Reusable function from your original file
export const normalizeGenreName = (name: string): string => {
	// Added handling for specific cases like 'Sci-Fi' -> 'scifi'
	// and 'CGDCT' which might need special normalization if desired.
	// Keeping simple normalization for now.
	return name
		.toLowerCase()
		.replace(/\s+|-|\(|\)|&/g, '') // Remove spaces, hyphens, parentheses, ampersands
		.replace('sci-fi', 'scifi'); // Specific replacement
};

// Configuration object for Anime Genres
export const animeGenresConfig: Record<string, GenreConfig> = {
	// Based on PHP array: id => name
	action: {
		id: 1,
		IconComponent: Swords,
		color: 'var(--mantine-color-red-5)',
		background: 'var(--mantine-color-red-9)',
		image: '/anime_genre_images/action-bg.webp',
		description: animeGenreDescriptions.action,
	},
	adventure: {
		id: 2,
		IconComponent: Compass,
		color: 'var(--mantine-color-orange-5)',
		background: 'var(--mantine-color-orange-9)',
		image: '/anime_genre_images/adventure-bg.webp',
		description: animeGenreDescriptions.adventure,
	},
	avantgarde: {
		id: 5,
		IconComponent: Atom,
		color: 'var(--mantine-color-violet-5)',
		background: 'var(--mantine-color-violet-9)',
		image: '/anime_genre_images/avantgarde-bg.webp',
		description: animeGenreDescriptions.avantgarde,
	},
	awardwinning: {
		id: 46,
		IconComponent: Trophy,
		color: 'var(--mantine-color-yellow-5)',
		background: 'var(--mantine-color-yellow-9)',
		image: '/anime_genre_images/awardwinning-bg.webp',
		description: animeGenreDescriptions.awardwinning,
	},
	boyslove: {
		id: 28,
		IconComponent: Heart, // Simple Heart, distinct color
		color: 'var(--mantine-color-blue-4)',
		background: 'var(--mantine-color-blue-9)',
		image: '/anime_genre_images/boyslove-bg.webp',
		description: animeGenreDescriptions.boyslove,
	},
	comedy: {
		id: 4,
		IconComponent: Laugh,
		color: 'var(--mantine-color-pink-5)',
		background: 'var(--mantine-color-pink-9)',
		image: '/anime_genre_images/comedy-bg.webp',
		description: animeGenreDescriptions.comedy,
	},
	drama: {
		id: 8,
		IconComponent: Drama,
		color: 'var(--mantine-color-grape-5)',
		background: 'var(--mantine-color-grape-9)',
		image: '/anime_genre_images/drama-bg.webp',
		description: animeGenreDescriptions.drama,
	},
	fantasy: {
		id: 10,
		IconComponent: Wand,
		color: 'var(--mantine-color-indigo-5)',
		background: 'var(--mantine-color-indigo-9)',
		image: '/anime_genre_images/fantasy-bg.webp',
		description: animeGenreDescriptions.fantasy,
	},
	girlslove: {
		id: 26,
		IconComponent: Heart, // Simple Heart, distinct color
		color: 'var(--mantine-color-red-4)',
		background: 'var(--mantine-color-red-9)',
		image: '/anime_genre_images/girlslove-bg.webp',
		description: animeGenreDescriptions.girlslove,
	},
	gourmet: {
		id: 47,
		IconComponent: ChefHat,
		color: 'var(--mantine-color-lime-5)',
		background: 'var(--mantine-color-lime-9)',
		image: '/anime_genre_images/gourmet-bg.webp',
		description: animeGenreDescriptions.gourmet,
	},
	horror: {
		id: 14,
		IconComponent: Ghost,
		color: 'var(--mantine-color-dark-3)',
		background: 'var(--mantine-color-dark-8)',
		image: '/anime_genre_images/horror-bg.webp',
		description: animeGenreDescriptions.horror,
	},
	mystery: {
		id: 7,
		IconComponent: HelpCircle,
		color: 'var(--mantine-color-cyan-5)',
		background: 'var(--mantine-color-cyan-9)',
		image: '/anime_genre_images/mystery-bg.webp',
		description: animeGenreDescriptions.mystery,
	},
	romance: {
		id: 22,
		IconComponent: HandHeart,
		color: 'var(--mantine-color-pink-4)',
		background: 'var(--mantine-color-pink-8)',
		image: '/anime_genre_images/romance-bg.webp',
		description: animeGenreDescriptions.romance,
	},
	scifi: {
		id: 24,
		IconComponent: Rocket,
		color: 'var(--mantine-color-blue-5)',
		background: 'var(--mantine-color-blue-9)',
		image: '/anime_genre_images/scifi-bg.webp',
		description: animeGenreDescriptions.scifi,
	},
	sliceoflife: {
		id: 36,
		IconComponent: Home,
		color: 'var(--mantine-color-green-5)',
		background: 'var(--mantine-color-green-9)',
		image: '/anime_genre_images/sliceoflife-bg.webp',
		description: animeGenreDescriptions.sliceoflife,
	},
	sports: {
		id: 30,
		IconComponent: Medal, // Or Trophy
		color: 'var(--mantine-color-orange-6)',
		background: 'var(--mantine-color-orange-9)',
		image: '/anime_genre_images/sports-bg.webp',
		description: animeGenreDescriptions.sports,
	},
	supernatural: {
		id: 37,
		IconComponent: Sparkles, // Or Ghost
		color: 'var(--mantine-color-purple-5)',
		background: 'var(--mantine-color-purple-9)',
		image: '/anime_genre_images/supernatural-bg.webp',
		description: animeGenreDescriptions.supernatural,
	},
	suspense: {
		id: 41,
		IconComponent: Hourglass, // Or Drama
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-gray-8)',
		image: '/anime_genre_images/suspense-bg.webp',
		description: animeGenreDescriptions.suspense,
	},
	ecchi: {
		id: 9,
		IconComponent: Flame, // Suggestive heat
		color: 'var(--mantine-color-orange-4)',
		background: 'var(--mantine-color-orange-8)',
		image: '/anime_genre_images/ecchi-bg.webp',
		description: animeGenreDescriptions.ecchi,
	},
	erotica: {
		id: 49,
		IconComponent: Heart, // Or Ban/AlertTriangle if needed
		color: 'var(--mantine-color-red-6)',
		background: 'var(--mantine-color-red-9)',
		image: '/anime_genre_images/erotica-bg.webp',
		description: animeGenreDescriptions.erotica,
	},
	hentai: {
		id: 12,
		IconComponent: Ban, // Explicit warning icon
		color: 'var(--mantine-color-dark-4)',
		background: 'var(--mantine-color-dark-9)',
		image: '/anime_genre_images/hentai-bg.webp',
		description: animeGenreDescriptions.hentai,
	},
	adultcast: {
		id: 50,
		IconComponent: Briefcase, // Represents work/adult life
		color: 'var(--mantine-color-teal-5)',
		background: 'var(--mantine-color-teal-9)',
		image: '/anime_genre_images/adultcast-bg.webp',
		description: animeGenreDescriptions.adultcast,
	},
	anthropomorphic: {
		id: 51,
		IconComponent: PawPrint, // Represents animals
		color: 'var(--mantine-color-yellow-6)',
		background: 'var(--mantine-color-yellow-9)',
		image: '/anime_genre_images/anthropomorphic-bg.webp',
		description: animeGenreDescriptions.anthropomorphic,
	},
	cgdct: {
		id: 52,
		IconComponent: Smile, // Or Sparkles
		color: 'var(--mantine-color-pink-3)',
		background: 'var(--mantine-color-pink-7)',
		image: '/anime_genre_images/cgdct-bg.webp',
		description: animeGenreDescriptions.cgdct,
	},
	childcare: {
		id: 53,
		IconComponent: Baby,
		color: 'var(--mantine-color-blue-3)',
		background: 'var(--mantine-color-blue-7)',
		image: '/anime_genre_images/childcare-bg.webp',
		description: animeGenreDescriptions.childcare,
	},
	combatsports: {
		id: 54,
		IconComponent: Activity, // Or Swords
		color: 'var(--mantine-color-red-6)',
		background: 'var(--mantine-color-red-9)',
		image: '/anime_genre_images/combatsports-bg.webp',
		description: animeGenreDescriptions.combatsports,
	},
	crossdressing: {
		id: 81,
		IconComponent: Users, // Generic representation
		color: 'var(--mantine-color-violet-4)',
		background: 'var(--mantine-color-violet-8)',
		image: '/anime_genre_images/crossdressing-bg.webp',
		description: animeGenreDescriptions.crossdressing,
	},
	delinquents: {
		id: 55,
		IconComponent: Skull,
		color: 'var(--mantine-color-gray-6)',
		background: 'var(--mantine-color-gray-9)',
		image: '/anime_genre_images/delinquents-bg.webp',
		description: animeGenreDescriptions.delinquents,
	},
	detective: {
		id: 39,
		IconComponent: Search,
		color: 'var(--mantine-color-cyan-6)',
		background: 'var(--mantine-color-cyan-9)',
		image: '/anime_genre_images/detective-bg.webp',
		description: animeGenreDescriptions.detective,
	},
	educational: {
		id: 56,
		IconComponent: BookOpen,
		color: 'var(--mantine-color-lime-6)',
		background: 'var(--mantine-color-lime-9)',
		image: '/anime_genre_images/educational-bg.webp',
		description: animeGenreDescriptions.educational,
	},
	gaghumor: {
		id: 57,
		IconComponent: Laugh, // Same as Comedy
		color: 'var(--mantine-color-pink-6)',
		background: 'var(--mantine-color-pink-9)',
		image: '/anime_genre_images/gaghumor-bg.webp',
		description: animeGenreDescriptions.gaghumor,
	},
	gore: {
		id: 58,
		IconComponent: Droplet, // Represents blood
		color: 'var(--mantine-color-red-7)',
		background: 'var(--mantine-color-dark-7)',
		image: '/anime_genre_images/gore-bg.webp',
		description: animeGenreDescriptions.gore,
	},
	harem: {
		id: 35,
		IconComponent: Users, // Multiple people around one
		color: 'var(--mantine-color-grape-4)',
		background: 'var(--mantine-color-grape-8)',
		image: '/anime_genre_images/harem-bg.webp',
		description: animeGenreDescriptions.harem,
	},
	highstakesgame: {
		id: 59,
		IconComponent: Dice3,
		color: 'var(--mantine-color-yellow-5)',
		background: 'var(--mantine-color-dark-6)',
		image: '/anime_genre_images/highstakesgame-bg.webp',
		description: animeGenreDescriptions.highstakesgame,
	},
	historical: {
		id: 13,
		IconComponent: Scroll,
		color: 'var(--mantine-color-orange-5)',
		background: 'var(--mantine-color-orange-9)',
		image: '/anime_genre_images/historical-bg.webp',
		description: animeGenreDescriptions.historical,
	},
	idolsfemale: {
		id: 60,
		IconComponent: Star, // Or Mic
		color: 'var(--mantine-color-pink-4)',
		background: 'var(--mantine-color-pink-8)',
		image: '/anime_genre_images/idolsfemale-bg.webp',
		description: animeGenreDescriptions.idolsfemale,
	},
	idolsmale: {
		id: 61,
		IconComponent: Star, // Or Mic
		color: 'var(--mantine-color-blue-4)',
		background: 'var(--mantine-color-blue-8)',
		image: '/anime_genre_images/idolsmale-bg.webp',
		description: animeGenreDescriptions.idolsmale,
	},
	isekai: {
		id: 62,
		IconComponent: DoorOpen, // Entering a new world
		color: 'var(--mantine-color-teal-4)',
		background: 'var(--mantine-color-teal-8)',
		image: '/anime_genre_images/isekai-bg.webp',
		description: animeGenreDescriptions.isekai,
	},
	iyashikei: {
		id: 63,
		IconComponent: Leaf, // Or Feather - represents healing/nature
		color: 'var(--mantine-color-green-4)',
		background: 'var(--mantine-color-green-8)',
		image: '/anime_genre_images/iyashikei-bg.webp',
		description: animeGenreDescriptions.iyashikei,
	},
	lovepolygon: {
		id: 64,
		IconComponent: GitMerge, // Represents complex connections
		color: 'var(--mantine-color-grape-5)',
		background: 'var(--mantine-color-grape-9)',
		image: '/anime_genre_images/lovepolygon-bg.webp',
		description: animeGenreDescriptions.lovepolygon,
	},
	magicalsexshift: {
		id: 65,
		IconComponent: Repeat, // Represents transformation/change
		color: 'var(--mantine-color-violet-5)',
		background: 'var(--mantine-color-violet-9)',
		image: '/anime_genre_images/magicalsexshift-bg.webp',
		description: animeGenreDescriptions.magicalsexshift,
	},
	mahoushoujo: {
		id: 66,
		IconComponent: Wand, // Magical Girl
		color: 'var(--mantine-color-pink-5)',
		background: 'var(--mantine-color-indigo-8)', // Mix colors for magic
		image: '/anime_genre_images/mahoushoujo-bg.webp',
		description: animeGenreDescriptions.mahoushoujo,
	},
	martialarts: {
		id: 17,
		IconComponent: UserCheck, // Represents skilled individual combat
		color: 'var(--mantine-color-red-5)',
		background: 'var(--mantine-color-orange-9)',
		image: '/anime_genre_images/martialarts-bg.webp',
		description: animeGenreDescriptions.martialarts,
	},
	mecha: {
		id: 18,
		IconComponent: Bot,
		color: 'var(--mantine-color-blue-6)',
		background: 'var(--mantine-color-gray-8)',
		image: '/anime_genre_images/mecha-bg.webp',
		description: animeGenreDescriptions.mecha,
	},
	medical: {
		id: 67,
		IconComponent: Stethoscope,
		color: 'var(--mantine-color-cyan-4)',
		background: 'var(--mantine-color-cyan-8)',
		image: '/anime_genre_images/medical-bg.webp',
		description: animeGenreDescriptions.medical,
	},
	military: {
		id: 38,
		IconComponent: Shield,
		color: 'var(--mantine-color-green-6)',
		background: 'var(--mantine-color-dark-7)',
		image: '/anime_genre_images/military-bg.webp',
		description: animeGenreDescriptions.military,
	},
	music: {
		id: 19,
		IconComponent: Music,
		color: 'var(--mantine-color-grape-4)',
		background: 'var(--mantine-color-grape-8)',
		image: '/anime_genre_images/music-bg.webp',
		description: animeGenreDescriptions.music,
	},
	mythology: {
		id: 68,
		IconComponent: BookOpen, // Or Scroll
		color: 'var(--mantine-color-yellow-5)',
		background: 'var(--mantine-color-orange-8)',
		image: '/anime_genre_images/mythology-bg.webp',
		description: animeGenreDescriptions.mythology,
	},
	organizedcrime: {
		id: 68,
		IconComponent: Briefcase, // Represents business/underworld dealings
		color: 'var(--mantine-color-dark-4)',
		background: 'var(--mantine-color-dark-8)',
		image: '/anime_genre_images/organizedcrime-bg.webp',
		description: animeGenreDescriptions.organizedcrime,
	},
	otakuculture: {
		id: 69,
		IconComponent: Package, // Represents merchandise/fandom
		color: 'var(--mantine-color-blue-4)',
		background: 'var(--mantine-color-indigo-8)',
		image: '/anime_genre_images/otakuculture-bg.webp',
		description: animeGenreDescriptions.otakuculture,
	},
	parody: {
		id: 20,
		IconComponent: Drama, // Reusing Drama icon for theatrical imitation
		color: 'var(--mantine-color-lime-5)',
		background: 'var(--mantine-color-yellow-9)',
		image: '/anime_genre_images/parody-bg.webp',
		description: animeGenreDescriptions.parody,
	},
	performingarts: {
		id: 70,
		IconComponent: VenetianMask, // Or Theater
		color: 'var(--mantine-color-violet-4)',
		background: 'var(--mantine-color-grape-8)',
		image: '/anime_genre_images/performingarts-bg.webp',
		description: animeGenreDescriptions.performingarts,
	},
	pets: {
		id: 71,
		IconComponent: PawPrint,
		color: 'var(--mantine-color-yellow-4)',
		background: 'var(--mantine-color-lime-8)',
		image: '/anime_genre_images/pets-bg.webp',
		description: animeGenreDescriptions.pets,
	},
	psychological: {
		id: 40,
		IconComponent: Brain,
		color: 'var(--mantine-color-indigo-4)',
		background: 'var(--mantine-color-dark-7)',
		image: '/anime_genre_images/psychological-bg.webp',
		description: animeGenreDescriptions.psychological,
	},
	racing: {
		id: 3,
		IconComponent: Flag, // Or Car
		color: 'var(--mantine-color-gray-4)',
		background: 'var(--mantine-color-red-8)',
		image: '/anime_genre_images/racing-bg.webp',
		description: animeGenreDescriptions.racing,
	},
	reincarnation: {
		id: 72,
		IconComponent: Recycle, // Or Repeat
		color: 'var(--mantine-color-green-5)',
		background: 'var(--mantine-color-teal-9)',
		image: '/anime_genre_images/reincarnation-bg.webp',
		description: animeGenreDescriptions.reincarnation,
	},
	reverseharem: {
		id: 73,
		IconComponent: Users, // Similar to Harem, different context
		color: 'var(--mantine-color-pink-4)',
		background: 'var(--mantine-color-grape-8)',
		image: '/anime_genre_images/reverseharem-bg.webp',
		description: animeGenreDescriptions.reverseharem,
	},
	lovestatusquo: {
		id: 74,
		IconComponent: HeartHandshake, // Represents relationship dynamics
		color: 'var(--mantine-color-gray-4)',
		background: 'var(--mantine-color-gray-8)',
		image: '/anime_genre_images/lovestatusquo-bg.webp',
		description: animeGenreDescriptions.lovestatusquo,
	},
	samurai: {
		id: 21,
		IconComponent: Swords, // Distinct from generic Action if needed
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-red-9)',
		image: '/anime_genre_images/samurai-bg.webp',
		description: animeGenreDescriptions.samurai,
	},
	school: {
		id: 23,
		IconComponent: GraduationCap, // Or School
		color: 'var(--mantine-color-blue-5)',
		background: 'var(--mantine-color-cyan-9)',
		image: '/anime_genre_images/school-bg.webp',
		description: animeGenreDescriptions.school,
	},
	showbiz: {
		id: 75,
		IconComponent: Clapperboard, // Or Film/Star
		color: 'var(--mantine-color-yellow-4)',
		background: 'var(--mantine-color-violet-8)',
		image: '/anime_genre_images/showbiz-bg.webp',
		description: animeGenreDescriptions.showbiz,
	},
	space: {
		id: 29,
		IconComponent: Orbit, // Or Rocket
		color: 'var(--mantine-color-indigo-5)',
		background: 'var(--mantine-color-dark-8)',
		image: '/anime_genre_images/space-bg.webp',
		description: animeGenreDescriptions.space,
	},
	strategygame: {
		id: 11,
		IconComponent: Puzzle, // Or Gamepad2
		color: 'var(--mantine-color-teal-5)',
		background: 'var(--mantine-color-blue-9)',
		image: '/anime_genre_images/strategygame-bg.webp',
		description: animeGenreDescriptions.strategygame,
	},
	superpower: {
		id: 31,
		IconComponent: Zap, // Or Sparkles
		color: 'var(--mantine-color-yellow-5)',
		background: 'var(--mantine-color-red-9)',
		image: '/anime_genre_images/superpower-bg.webp',
		description: animeGenreDescriptions.superpower,
	},
	survival: {
		id: 76,
		IconComponent: Mountain, // Or Tent
		color: 'var(--mantine-color-lime-6)',
		background: 'var(--mantine-color-gray-8)',
		image: '/anime_genre_images/survival-bg.webp',
		description: animeGenreDescriptions.survival,
	},
	teamsports: {
		id: 77,
		IconComponent: Users, // Represents team aspect
		color: 'var(--mantine-color-orange-5)',
		background: 'var(--mantine-color-green-9)',
		image: '/anime_genre_images/teamsports-bg.webp',
		description: animeGenreDescriptions.teamsports,
	},
	timetravel: {
		id: 78,
		IconComponent: Clock, // Or History
		color: 'var(--mantine-color-cyan-5)',
		background: 'var(--mantine-color-indigo-9)',
		image: '/anime_genre_images/timetravel-bg.webp',
		description: animeGenreDescriptions.timetravel,
	},
	vampire: {
		id: 32,
		IconComponent: Moon, // Associated with night/vampires
		color: 'var(--mantine-color-red-6)',
		background: 'var(--mantine-color-dark-8)',
		image: '/anime_genre_images/vampire-bg.webp',
		description: animeGenreDescriptions.vampire,
	},
	videogame: {
		id: 79,
		IconComponent: Gamepad2,
		color: 'var(--mantine-color-blue-5)',
		background: 'var(--mantine-color-violet-9)',
		image: '/anime_genre_images/videogame-bg.webp',
		description: animeGenreDescriptions.videogame,
	},
	visualarts: {
		id: 80,
		IconComponent: Paintbrush,
		color: 'var(--mantine-color-orange-4)',
		background: 'var(--mantine-color-yellow-8)',
		image: '/anime_genre_images/visualarts-bg.webp',
		description: animeGenreDescriptions.visualarts,
	},
	workplace: {
		id: 48,
		IconComponent: Briefcase, // Same as Adult Cast, maybe use different icon if needed
		color: 'var(--mantine-color-teal-6)',
		background: 'var(--mantine-color-teal-9)',
		image: '/anime_genre_images/workplace-bg.webp',
		description: animeGenreDescriptions.workplace,
	},
	urbanfantasy: {
		id: 82,
		IconComponent: Building, // City + Magic (Wand?) can be alternatives
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-indigo-8)',
		image: '/anime_genre_images/urbanfantasy-bg.webp',
		description: animeGenreDescriptions.urbanfantasy,
	},
	villainess: {
		id: 83,
		IconComponent: Crown, // Often involves royalty/nobility context
		color: 'var(--mantine-color-purple-5)',
		background: 'var(--mantine-color-dark-7)',
		image: '/anime_genre_images/villainess-bg.webp',
		description: animeGenreDescriptions.villainess,
	},

	// Demographics
	josei: {
		id: 43,
		IconComponent: User, // Simple adult female target
		color: 'var(--mantine-color-pink-5)',
		background: 'var(--mantine-color-grape-9)',
		image: '/anime_genre_images/josei-bg.webp',
		description: animeGenreDescriptions.josei,
	},
	kids: {
		id: 15,
		IconComponent: Baby, // Same as Childcare
		color: 'var(--mantine-color-yellow-4)',
		background: 'var(--mantine-color-blue-7)',
		image: '/anime_genre_images/kids-bg.webp',
		description: animeGenreDescriptions.kids,
	},
	seinen: {
		id: 42,
		IconComponent: UserCog, // Simple adult male target + complexity hint
		color: 'var(--mantine-color-blue-6)',
		background: 'var(--mantine-color-dark-8)',
		image: '/anime_genre_images/seinen-bg.webp',
		description: animeGenreDescriptions.seinen,
	},
	shoujo: {
		id: 25,
		IconComponent: Heart, // Simple young female target + emotion hint
		color: 'var(--mantine-color-red-4)',
		background: 'var(--mantine-color-pink-8)',
		image: '/anime_genre_images/shoujo-bg.webp',
		description: animeGenreDescriptions.shoujo,
	},
	shounen: {
		id: 27,
		IconComponent: UserRound, // Simple young male target
		color: 'var(--mantine-color-orange-5)',
		background: 'var(--mantine-color-red-9)',
		image: '/anime_genre_images/shounen-bg.webp',
		description: animeGenreDescriptions.shounen,
	},

	// Default Fallback
	default: {
		id: 0,
		IconComponent: Tv, // Generic Anime/TV icon
		color: 'var(--mantine-color-gray-5)',
		background: 'var(--mantine-color-dark-8)',
		image: '/anime_genre_images/default-bg.webp', // A generic anime-related image
		description: animeGenreDescriptions.default,
	},
};

// Function to retrieve config, falling back to default
export const getAnimeGenreConfig = (genreName: string): GenreConfig => {
	// Handle potential variations like "Sci-Fi" vs "scifi"
	const normalizedKey = normalizeGenreName(genreName);

	let config = animeGenresConfig[normalizedKey];

	// Optional: Add a fallback for the original non-normalized name if needed
	if (!config) {
		config = animeGenresConfig[genreName.toLowerCase()];
	}

	return config || animeGenresConfig.default;
};
