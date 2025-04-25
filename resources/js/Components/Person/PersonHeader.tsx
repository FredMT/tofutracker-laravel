import { usePersonContext } from '@/Components/Person/store/personStore';
import { Box, Image, Stack, Text } from '@mantine/core';

export default function PersonHeader() {
	const headerData = usePersonContext((state) => ({
		person: state.person,
		randomMediaDetails: state.randomMediaDetails,
	}));

	return (
		<Box
			pos='relative'
			h={{ base: '65vh' }}
			className='overflow-hidden w-full'
		>
			<Box
				pos='absolute'
				inset={0}
				className='bg-gradient-to-b from-black/60 via-black/40 to-dark z-10'
			></Box>

			{headerData.randomMediaDetails?.title &&
				headerData.randomMediaDetails.character && (
					<Box
						pos='absolute'
						className='p-2 pr-6 bg-black/50 rounded-tl-md z-20 top-0 right-0 sm:bottom-0 sm:right-0 sm:top-auto'
					>
						<Stack gap={4}>
							<Text
								fw={700}
								c='white'
								size='sm'
							>
								{headerData.randomMediaDetails.title}
							</Text>
							<Text
								c='white'
								size='sm'
							>
								as {headerData.randomMediaDetails.character}
							</Text>
						</Stack>
					</Box>
				)}

			<Box
				pos='absolute'
				inset={0}
				className='w-full'
			>
				{headerData.randomMediaDetails?.backdrop_path && (
					<Image
						src={`https://image.tmdb.org/t/p/original${headerData.randomMediaDetails.backdrop_path}`}
						alt='Backdrop'
						className='w-full h-full object-cover object-center opacity-75'
					/>
				)}
			</Box>

			<Box
				pos='relative'
				className='container mx-auto px-4 h-full flex flex-col justify-end'
			>
				<Box className='relative w-full pb-4'>
					<Box className='flex flex-col md:flex-row items-end md:items-end gap-4 relative'>
						<Box className='md:hidden absolute left-1/2 transform -translate-x-1/2 -translate-y-full w-full flex justify-center'>
							<Box className='size-48 rounded-md border-2 border-gray-700 shadow-lg flex-shrink-0'>
								{headerData.person.profile_path && (
									<Image
										src={`https://image.tmdb.org/t/p/w500/${headerData.person.profile_path}`}
										alt={headerData.person.name}
										className='w-full h-full object-cover'
									/>
								)}
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
