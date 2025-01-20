import {Box, Image} from "@mantine/core";
import React from "react";
import {Carousel} from "@mantine/carousel";
import WelcomeCarouselCard from "./WelcomeCarouselCard";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import {WelcomeProviderCarousel} from "./WelcomeProviderCarousel";

interface WatchProviderItem {
    id: number;
    anime_id?: number;
    media_type: string;
    title: string;
    release_date: string;
    vote_average: number;
    popularity: number;
    poster_path: string | null;
    backdrop_path: string | null;
}

interface WatchProviderData {
    provider_name: string;
    provider_logo: string;
    items: WatchProviderItem[];
}

interface DiscoverWatchProviderProps {
    providerId: string;
    data: WatchProviderData;
    onProviderChange: (providerId: string) => void;
}

function DiscoverWatchProvider({
    providerId,
    data,
    onProviderChange,
}: DiscoverWatchProviderProps) {
    const backgroundImage = data.items[0]?.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${data.items[0].backdrop_path}`
        : "";

    return (
        <Box pos="relative" h={700} mb="xl">
            <Image
                src={backgroundImage}
                h="100%"
                w="100%"
                fit="cover"
                style={{
                    filter: "brightness(0.7)",
                }}
                loading="lazy"
            />
            <Box
                pos="absolute"
                bottom={0}
                left={0}
                right={0}
                style={{
                    background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
                    padding: "20px 0",
                }}
            >
                <ResponsiveContainer>
                    <WelcomeProviderCarousel
                        providerId={providerId}
                        slideSize="200px"
                        onProviderChange={onProviderChange}
                    >
                        {data.items.map((item: WatchProviderItem) => (
                            <Carousel.Slide
                                key={`${item.media_type}-${item.id}`}
                            >
                                <WelcomeCarouselCard
                                    id={item.id}
                                    anime_id={item.anime_id}
                                    title={item.title}
                                    posterPath={item.poster_path}
                                    type={item.media_type}
                                    vote_average={item.vote_average}
                                />
                            </Carousel.Slide>
                        ))}
                    </WelcomeProviderCarousel>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}

interface DiscoverWatchProvidersProps {
    providers: Record<string, WatchProviderData>;
}

export function DiscoverWatchProviders({
    providers,
}: DiscoverWatchProvidersProps) {
    const [activeProviderId, setActiveProviderId] = React.useState<string>(
        Object.keys(providers)[0] || ""
    );

    const activeProvider = providers[activeProviderId];

    if (!activeProvider) return null;

    return (
        <DiscoverWatchProvider
            providerId={activeProviderId}
            data={activeProvider}
            onProviderChange={setActiveProviderId}
        />
    );
}

export default DiscoverWatchProviders;
