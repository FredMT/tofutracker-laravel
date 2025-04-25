import {
	useFormattedBirthday,
	usePersonAge,
	usePersonContext,
} from '@/Components/Person/store/personStore';
import { Space } from '@mantine/core';
import {
	CalendarIcon,
	FilmIcon,
	MapPinIcon,
	TvIcon,
	UserIcon,
	VideoIcon,
} from 'lucide-react';

export default function PersonStats() {
	const personData = usePersonContext((state) => ({
		person: state.person,
		totalCreditsCount: state.totalCreditsCount,
		movieCreditsCount: state.uniqueMovieCreditsCount,
		tvCreditsCount: state.uniqueTvCreditsCount,
		animeCreditsCount: state.uniqueAnimeCreditsCount,
	}));

	const age = usePersonAge();
	const birthday = useFormattedBirthday();

	const personalInfo = [
		{ label: 'AGE', value: age, icon: UserIcon },
		{
			label: 'GENDER',
			value: personData.person.gender === 1 ? 'Female' : 'Male',
			icon: UserIcon,
		},
		{ label: 'BIRTHDAY', value: birthday, icon: CalendarIcon },
		{
			label: 'BIRTHPLACE',
			value: personData.person.place_of_birth || 'N/A',
			icon: MapPinIcon,
		},
		{
			label: 'KNOWN FOR',
			value: personData.person.known_for_department,
			icon: VideoIcon,
		},
	];

	const statsData = [
		{ label: 'Credits', value: personData.totalCreditsCount, icon: VideoIcon },
		{ label: 'Movies', value: personData.movieCreditsCount, icon: FilmIcon },
		{ label: 'TV Shows', value: personData.tvCreditsCount, icon: TvIcon },
		{ label: 'Anime', value: personData.animeCreditsCount, icon: VideoIcon },
	];

	return (
		<div className='space-y-3 w-full my-4'>
			{/* Personal Information Cards - Compact grid */}
			<div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
				{personalInfo.map((item, index) => (
					<div
						key={index}
						className='shadow-md shadow-violet-500/20 dark:shadow-red-500/20 rounded-md p-2'
					>
						<div className='flex items-center gap-2'>
							<div className=' p-1.5 rounded-full'>
								<item.icon className='w-3 h-3 ' />
							</div>
							<div className='min-w-0 flex-1'>
								<p className='text-xs uppercase tracking-wider'>{item.label}</p>
								<p className='text-sm font-medium'>{item.value}</p>
							</div>
						</div>
					</div>
				))}
			</div>

			<Space />

			<div className='flex gap-3 justify-center md:justify-start flex-wrap'>
				{statsData.map((stat, index) => (
					<div
						key={index}
						className=' rounded-md p-3 shadow-sm borderflex-1 max-w-[150px]'
					>
						<div className='flex flex-col items-center gap-1'>
							<stat.icon className='w-4 h-4 ' />
							<p className='text-xl font-bold'>{stat.value}</p>
							<span className='text-xs px-2 py-0.5 rounded-full '>
								{stat.label}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
