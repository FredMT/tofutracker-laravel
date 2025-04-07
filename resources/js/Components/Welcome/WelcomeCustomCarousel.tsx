import { Carousel } from '@mantine/carousel';
import { Container, ContainerProps, Space, Stack, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ReactNode } from 'react';
import classes from './WelcomeCustomCarousel.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WelcomeCustomCarouselProps {
	children: ReactNode;
	containerWidth?: ContainerProps['size'];
	slideSize?: string;
	height?: number;
	slidesToScroll?: number;
	withControls?: boolean;
	align?: 'start' | 'center' | 'end';
	className?: string;
	slideGap?: number;
}

export function WelcomeCustomCarousel({
	children,
	containerWidth = '100%',
	slideSize = '300px',
	height = 300,
	slidesToScroll = 3,
	withControls = true,
	align = 'start',
	slideGap = 0,
	className,
}: WelcomeCustomCarouselProps) {
	const isMobile = useMediaQuery('(max-width: 500px)');

	// If on mobile, only scroll 1 slide at a time
	const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;

	return (
		<Stack gap='xs'>
			<div className={classes.sectionHeaderTextWrapper}>
				<h2 className={classes.top10Text}>TOP 20</h2>
				<div style={{ marginBottom: '4px' }}>
					<p className={classes.contentText}>CONTENT</p>
					<p className={classes.contentText}>THIS WEEK</p>
				</div>
			</div>
			<Space h='xs' />
			<Container
				size={containerWidth}
				className='select-none'
				px={60}
				mx={0}
			>
				<Carousel
					height={height}
					slideSize={slideSize}
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
					{children}
				</Carousel>
			</Container>
		</Stack>
	);
}

export default WelcomeCustomCarousel;
