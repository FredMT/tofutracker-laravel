import { Carousel } from '@mantine/carousel';
import { Box, ContainerProps } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import WelcomeCarouselCard from './WelcomeCarouselCard';
import classes from './WelcomeCustomCarousel.module.css';
import ResponsiveContainer from '../ResponsiveContainer';

interface ContentItem {
	title: string;
	release_date: string;
	poster_path: string;
	vote_average: number;
	popularity: number;
	link: number | string;
	type: string;
}

interface WelcomeCustomCarouselContentProps {
	children?: React.ReactNode;
	containerWidth?: ContainerProps['size'];
	slideSize?: string;
	height?: number;
	slidesToScroll?: number;
	withControls?: boolean;
	align?: 'start' | 'center' | 'end';
	className?: string;
	slideGap?: number;
	title?: string;
	titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
	movies: ContentItem[];
	tvShows: ContentItem[];
	anime: ContentItem[];
}

export function WelcomeCustomCarouselContent({
	slideSize = '220px',
	height = 300,
	withControls = true,
	align = 'start',
	slideGap = 35,
	className,
	movies,
	tvShows,
	anime,
}: WelcomeCustomCarouselContentProps) {
	const [activeTab, setActiveTab] = React.useState<0 | 1 | 2>(0);

	const tabs = [
		{ id: 0, label: 'Movies', content: movies },
		{ id: 1, label: 'TV Shows', content: tvShows },
		{ id: 2, label: 'Anime', content: anime },
	];

	const getUniqueByLink = (items: ContentItem[]) => {
		const uniqueLinks = new Set();
		return items.filter((item) => {
			if (uniqueLinks.has(item.link)) return false;
			uniqueLinks.add(item.link);
			return true;
		});
	};

	const currentContent = getUniqueByLink(tabs[activeTab].content).sort(
		(a, b) => b.popularity - a.popularity
	);

	const getTabPosition = () => {
		switch (activeTab) {
			case 1:
				return 'translateX(100%)';
			case 2:
				return 'translateX(200%)';
			default:
				return 'translateX(0)';
		}
	};

	return (
		<Box
			className={classes.container}
			px={20}
		>
			<div className={classes.header}>
				<div className={classes.sectionHeaderTextWrapper}>
					<h2 className={classes.top10Text}>TOP 10</h2>
					<div style={{ marginBottom: '4px' }}>
						<p className={classes.contentText}>CONTENT</p>
						<p className={classes.contentText}>TODAY</p>
					</div>
				</div>

				<div className={classes.tabs}>
					<div className={classes.tabList}>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as 0 | 1 | 2)}
								className={`${classes.tab} ${
									activeTab === tab.id ? classes.tabActive : ''
								}`}
							>
								Top 10 {tab.label}
							</button>
						))}
					</div>
					<div
						className={classes.tabIndicator}
						style={{ transform: getTabPosition() }}
					/>
				</div>
			</div>
			<ResponsiveContainer>
				<Carousel
					key={activeTab}
					height={height}
					slideSize={slideSize}
					align={align}
					withControls={withControls}
					slideGap={slideGap}
					controlsOffset={0}
					previousControlIcon={<ChevronLeft size={40} />}
					nextControlIcon={<ChevronRight size={40} />}
					classNames={{
						controls: classes.carouselControls,
						control: classes.carouselControl,
					}}
					className={className}
				>
					{currentContent.slice(0, 10).map((content, index) => (
						<Carousel.Slide key={`${content.type}-${content.link}`}>
							<div
								className={`${classes.itemContainer} ${
									index === 0 ? classes.firstItem : ''
								}`}
							>
								<div className={classes.numberMarker}>{index + 1}</div>
								<div
									className={classes.cardContainer}
									style={{
										marginLeft:
											index === currentContent.length - 1 ? '90px' : '40px',
									}}
								>
									<WelcomeCarouselCard
										id={Number(content.link)}
										title={content.title}
										posterPath={content.poster_path}
										type={content.type}
										vote_average={content.vote_average}
									/>
								</div>
							</div>
						</Carousel.Slide>
					))}
				</Carousel>
			</ResponsiveContainer>
		</Box>
	);
}

export default WelcomeCustomCarouselContent;
