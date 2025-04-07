import { Carousel } from '@mantine/carousel';
import {
	Center,
	Container,
	ContainerProps,
	Group,
	Image,
	Indicator,
	Space,
	Stack,
	Title,
	UnstyledButton,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import classes from './WelcomeCustomCarousel.module.css';

interface WelcomeProviderCarouselProps {
	children: ReactNode;
	containerWidth?: ContainerProps['size'];
	slideSize?: string;
	height?: number;
	slidesToScroll?: number;
	withControls?: boolean;
	align?: 'start' | 'center' | 'end';
	className?: string;
	slideGap?: number;
	providerId: string;
	onProviderChange?: (providerId: string) => void;
}

const providers = [
	{ id: '8', name: 'Netflix', logoSrc: '/icons/welcome/netflix.png' },
	{ id: '1899', name: 'HBO Max', logoSrc: '/icons/welcome/hbomax.png' },
	{ id: '9', name: 'Prime Video', logoSrc: '/icons/welcome/primevideo.png' },
	{ id: '283', name: 'Crunchyroll', logoSrc: '/icons/welcome/crunchyroll.svg' },
	{ id: '337', name: 'Disney+', logoSrc: '/icons/welcome/disney.png' },
	{ id: '350', name: 'Apple TV+', logoSrc: '/icons/welcome/appletv.png' },
	{ id: '531', name: 'Paramount+', logoSrc: '/icons/welcome/paramount.png' },
];

export function WelcomeProviderCarousel({
	children,
	containerWidth = '100%',
	slideSize = '300px',
	height = 300,
	slidesToScroll = 3,
	withControls = true,
	align = 'start',
	slideGap = 0,
	className,
	providerId,
	onProviderChange,
}: WelcomeProviderCarouselProps) {
	const isMobile = useMediaQuery('(max-width: 500px)');
	const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;

	const activeProviderName =
		providers.find((p) => p.id === providerId)?.name || '';

	return (
		<Stack gap='xs'>
			<Container
				size={containerWidth}
				className='select-none'
				px={40}
				mx={0}
			>
				<Group
					gap={12}
					mb='md'
				>
					<Title order={3}>Discover Content From: {activeProviderName}</Title>
				</Group>
			</Container>
			<Container
				size={containerWidth}
				className='select-none'
				px={40}
				mx={0}
			>
				<Carousel
					slideSize='200px'
					h={80}
					align={align}
					slidesToScroll={mobileSlidesToScroll}
					withControls={withControls}
					controlsOffset={0}
					classNames={{
						control: classes.carouselControl,
						controls: classes.carouselControls,
					}}
					previousControlIcon={<ChevronLeft size={40} />}
					nextControlIcon={<ChevronRight size={40} />}
					className={className}
					slideGap={slideGap}
				>
					{providers.map((provider, index) => {
						const isActive = provider.id === providerId;
						return (
							<Carousel.Slide
								key={provider.id}
								className={index === 0 ? classes.firstItem : ''}
							>
								<Indicator
									size={15}
									offset={-15}
									position='bottom-center'
									color='white'
									withBorder
									disabled={!isActive}
									styles={{ indicator: { zIndex: 1 } }}
								>
									<Center
										className={classes.providerLogoContainer}
										style={{
											height: '100%',
											cursor: 'pointer',
											transition: 'transform 0.2s ease',
										}}
										onClick={() => onProviderChange?.(provider.id)}
									>
										<Image
											className={classes.providerLogoImage}
											src={provider.logoSrc}
											h={50}
											w='130px'
											fit='contain'
											alt={provider.name}
											loading='lazy'
										/>
									</Center>
								</Indicator>
							</Carousel.Slide>
						);
					})}
				</Carousel>
			</Container>

			<Space h='md' />

			<Container
				size={containerWidth}
				className='select-none'
				px={40}
				mx={0}
			>
				<Carousel
					height={height}
					slideSize={slideSize}
					align={align}
					slidesToScroll={mobileSlidesToScroll}
					withControls={withControls}
					controlsOffset={0}
					previousControlIcon={<ChevronLeft size={40} />}
					nextControlIcon={<ChevronRight size={40} />}
					classNames={{
						control: classes.carouselControl,
						controls: classes.carouselControls,
					}}
					className={className}
					slideGap={slideGap}
				>
					{children}
				</Carousel>
			</Container>
		</Stack>
	);
}
