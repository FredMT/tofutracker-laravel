import { router } from '@inertiajs/react';
import { Carousel, Embla } from '@mantine/carousel';
import { Container, LoadingOverlay, Select, Space, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import carouselClasses from '../Carousel.module.css';
import classes from '../StreamingSection.module.css';
import { countries } from './countries';
import ShowCard from './ShowCard';
import { useSearchParams } from '@/hooks/useSearchParams';
import { useUserRegion } from '@/propsHooks/useUserRegion';

interface StreamingCarouselProps {
	providers: Array<{
		provider_id: number;
		provider_name: string;
		provider_logo_path: string;
		shows: Array<{
			id: number;
			name: string | null;
			poster: string;
			rating: number | null;
			year: string | null;
		}>;
	}>;
}

export const StreamingCarousel: React.FC<StreamingCarouselProps> = ({
	providers,
}) => {
	const [selectedProvider, setSelectedProvider] = useState<number | null>(
		providers[0]?.provider_id ?? null
	);
	const [embla, setEmbla] = useState<Embla | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const tabsRef = useRef<HTMLDivElement>(null);
	const userRegion = useUserRegion();
	const { getParam } = useSearchParams();
	const providerCountry = getParam('providerCountry');
	const [selectedCountry, setSelectedCountry] = useState<string>(
		() => (providerCountry || userRegion || '') as string
	);

	useEffect(() => {
		if (providers.length > 0) {
			setSelectedProvider(providers[0].provider_id);
			if (embla) {
				embla.scrollTo(0, true);
			}
		}
	}, [providers, embla]);

	useEffect(() => {
		if (providerCountry) {
			setSelectedCountry(providerCountry);
		}
	}, [providerCountry]);

	useEffect(() => {
		if (embla) {
			embla.scrollTo(0, true);
		}
	}, [selectedProvider, embla]);

	useEffect(() => {
		if (tabsRef.current && selectedProvider) {
			const activeTab = tabsRef.current.querySelector(
				`[data-provider-id="${selectedProvider}"]`
			);
			if (activeTab) {
				const containerWidth = tabsRef.current.offsetWidth;
				const tabWidth = (activeTab as HTMLElement).offsetWidth;
				const tabLeft = (activeTab as HTMLElement).offsetLeft;
				const scrollPos = tabLeft - containerWidth / 2 + tabWidth / 2;

				tabsRef.current.scrollTo({
					left: Math.max(0, scrollPos),
					behavior: 'smooth',
				});
			}
		}
	}, [selectedProvider]);

	const currentProviderShows =
		providers.find((p) => p.provider_id === selectedProvider)?.shows || [];

	const handleRegionChange = (value: string | null) => {
		if (value) {
			setSelectedCountry(value);
			router.visit(route('shows.index'), {
				only: ['providers', 'user_region'],
				preserveState: true,
				preserveScroll: true,
				data: { providerCountry: value },
				showProgress: true,
				onStart: () => {
					setIsLoading(true);
				},
				onFinish: () => {
					setIsLoading(false);
				},
			});
		}
	};

	return (
		<>
			<div
				className={classes.titleContainer}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Title>Streaming</Title>
				<Select
					placeholder='Select country'
					data={countries.map((country) => ({
						value: country.iso_3166_1,
						label: country.english_name,
					}))}
					value={selectedCountry}
					searchable
					clearable={false}
					onChange={handleRegionChange}
					style={{ width: '250px' }}
				/>
			</div>
			<Space h='md' />

			<div style={{ position: 'relative', minHeight: '400px' }}>
				<LoadingOverlay
					visible={isLoading}
					loaderProps={{ color: 'grape', type: 'bars' }}
					zIndex={1000}
					overlayProps={{ radius: 'md' }}
				/>
				<div className={classes.header}>
					<div className={classes.tabsContainer}>
						<div
							className={classes.tabsList}
							ref={tabsRef}
						>
							{providers.map((provider) => (
								<motion.div
									key={provider.provider_id}
									data-provider-id={provider.provider_id}
									className={`${classes.tab} ${
										selectedProvider === provider.provider_id
											? classes.tabActive
											: ''
									}`}
									onClick={() => setSelectedProvider(provider.provider_id)}
									whileTap={{ scale: 0.95 }}
								>
									{provider.provider_name}
									{selectedProvider === provider.provider_id && (
										<motion.div
											layoutId='underline'
											className={classes.underline}
											transition={{
												type: 'spring',
												stiffness: 300,
												damping: 30,
											}}
										/>
									)}
								</motion.div>
							))}
						</div>
					</div>
				</div>

				{selectedProvider && currentProviderShows.length > 0 && (
					<Container
						size='100%'
						px={60}
						mx={0}
					>
						<Carousel
							height={300}
							slideSize={200}
							align='start'
							slidesToScroll='auto'
							loop={false}
							controlsOffset={0}
							getEmblaApi={setEmbla}
							inViewThreshold={0.1}
							classNames={{
								control: carouselClasses.carouselControl,
								controls: carouselClasses.carouselControls,
							}}
							previousControlIcon={<ChevronLeft size={40} />}
							nextControlIcon={<ChevronRight size={40} />}
							className='w-full'
						>
							{currentProviderShows.map((show, index) => (
								<Carousel.Slide key={show.id}>
									<motion.div
										initial='hidden'
										whileInView='visible'
										viewport={{ once: true }}
										transition={{
											duration: 0.3,
											delay: index * 0.05,
										}}
										variants={{
											visible: { opacity: 1, y: 0 },
											hidden: { opacity: 0, y: 20 },
										}}
									>
										<ShowCard
											show={{
												id: show.id.toString(),
												title: show.name ?? 'Untitled Show',
												poster: show.poster ?? '',
												rating: show.rating?.toString() ?? 'N/A',
												year: show.year ?? '',
											}}
										/>
									</motion.div>
								</Carousel.Slide>
							))}
						</Carousel>
					</Container>
				)}

				{selectedProvider && currentProviderShows.length === 0 && (
					<Container
						size='100%'
						px={60}
						mx={0}
						py='xl'
						style={{ textAlign: 'center', color: 'grey' }}
					>
						No shows available for this provider.
					</Container>
				)}
			</div>
		</>
	);
};
