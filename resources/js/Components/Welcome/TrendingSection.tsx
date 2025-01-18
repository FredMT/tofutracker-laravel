import { Carousel } from "@mantine/carousel";
import React from "react";
import WelcomeCarouselCard from "./WelcomeCarouselCard";
import WelcomeCustomCarousel from "./WelcomeCustomCarousel";
import WelcomeCustomCarouselContent from "./WelcomeCustomCarouselContent";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import { TrendingContent } from "@/types/trending";
import { usePage } from "@inertiajs/react";

function getContentType(type: string) {
    switch (type) {
        case "movie":
            return "movie";
        case "tv":
            return "tv";
        case "anime":
            return "anime";
        default:
            return "Unknown";
    }
}

function TrendingSection() {
    const { data } = usePage<{ data: TrendingContent }>().props;
    const allContent = [...data.movies, ...data.tv_shows, ...data.anime]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 20);

    return (
        <ResponsiveContainer>
            <WelcomeCustomCarousel title="Top 20" slideSize="200px">
                {allContent.map((content) => (
                    <Carousel.Slide key={`${content.type}-${content.link}`}>
                        <WelcomeCarouselCard
                            id={Number(content.link)}
                            title={content.title}
                            posterPath={content.poster_path}
                            type={getContentType(content.type)}
                            vote_average={content.vote_average}
                        />
                    </Carousel.Slide>
                ))}
            </WelcomeCustomCarousel>

            <WelcomeCustomCarouselContent
                title="Top 10"
                slideSize="200px"
                movies={data.movies}
                tvShows={data.tv_shows}
                anime={data.anime}
            />
        </ResponsiveContainer>
    );
}

export default TrendingSection;
