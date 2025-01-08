import DiscoverWatchProviders from "@/Components/Welcome/DiscoverWatchProvider";
import TrendingSection from "@/Components/Welcome/TrendingSection";
import WelcomeCarouselSlide from "@/Components/Welcome/WelcomeCarouselSlide";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { Carousel } from "@mantine/carousel";
import { Space } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import classes from "./Welcome.module.css";
import DiscoverByGenre from "@/Components/Welcome/DiscoverByGenre";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import { TrendingContent } from "@/types/trending";
import { GenresAndWatchProvidersHomepage } from "@/types/genresandwatchprovidershomepage";

interface MediaItem {
    title: string;
    backdrop_path: string | null;
    popularity: number;
    logo_path: string | null;
    genres: string[];
    overview: string;
    release_date: string;
    link: string | number;
    type: string;
}

function Welcome() {
    const { data, genresandwatchproviders } = usePage<{
        data: TrendingContent;
        genresandwatchproviders: GenresAndWatchProvidersHomepage;
    }>().props;
    const autoplay = useRef(Autoplay({ delay: 5000 }));

    // Sort each type by popularity
    const sortedMovies = [...data.movies]
        .map((item) => ({ ...item, type: "movie" }))
        .sort((a, b) => b.popularity - a.popularity);

    const sortedTv = [...data.tv_shows]
        .map((item) => ({ ...item, type: "tv" }))
        .sort((a, b) => b.popularity - a.popularity);

    const sortedAnime = [...data.anime]
        .map((item) => ({ ...item, type: "anime" }))
        .sort((a, b) => b.popularity - a.popularity);

    // Create final slides array starting with most popular TV show
    const finalSlides: MediaItem[] = [sortedTv[0]];

    sortedTv.shift();

    let movieIndex = 0;
    let tvIndex = 0;
    let animeIndex = 0;

    // Fill remaining slots by rotating through types, adding movie tv and anime if available
    while (
        movieIndex < sortedMovies.length ||
        tvIndex < sortedTv.length ||
        animeIndex < sortedAnime.length
    ) {
        if (movieIndex < sortedMovies.length) {
            finalSlides.push(sortedMovies[movieIndex]);
            movieIndex++;
        }

        if (tvIndex < sortedTv.length) {
            finalSlides.push(sortedTv[tvIndex]);
            tvIndex++;
        }

        if (animeIndex < sortedAnime.length) {
            finalSlides.push(sortedAnime[animeIndex]);
            animeIndex++;
        }
    }

    return (
        <>
            <Head title="Welcome" />
            <Carousel
                height={750}
                mih={750}
                mah={750}
                plugins={[autoplay.current]}
                onMouseEnter={autoplay.current.stop}
                onMouseLeave={autoplay.current.reset}
                loop
                classNames={{
                    control: classes.carouselControl,
                    controls: classes.carouselControls,
                }}
            >
                {finalSlides.map((item, index) => (
                    <Carousel.Slide key={`${item.type}-${item.link}-${index}`}>
                        <WelcomeCarouselSlide {...item} />
                    </Carousel.Slide>
                ))}
            </Carousel>
            <Space h="xl" />
            <TrendingSection />
            <Space h="xl" />
            <DiscoverWatchProviders
                providers={genresandwatchproviders.by_provider}
            />
            <Space h="xl" />
            <ResponsiveContainer>
                <DiscoverByGenre
                    genres={genresandwatchproviders.by_genre}
                    slideSize="200px"
                />
            </ResponsiveContainer>
        </>
    );
}

Welcome.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Welcome;
