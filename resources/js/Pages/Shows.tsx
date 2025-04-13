import ResponsiveContainer from "@/Components/ResponsiveContainer";
import AiringShowsCarousel from "@/Components/Shows/AiringShowsCarousel";
import ShowsBanner from "@/Components/Shows/ShowsBanner";
import TrendingShowsCarousel from "@/Components/Shows/TrendingShowsCarousel";
import TrailerSection from "@/Components/Shows/TrailerSection";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { Space } from "@mantine/core";
import StreamingSection from "@/Components/Shows/StreamingSection";
import { GenresSection } from "@/Components/Shows/GenresSection";

function Shows() {
    return (
        <div>
            <Space h={64} />
            <ShowsBanner />
            <Space h={64} />
            <ResponsiveContainer>
                <TrendingShowsCarousel />
                <Space h={24} />
                <TrailerSection />
                <Space h={24} />
                <GenresSection />
                <Space h={48} />
                <AiringShowsCarousel />
                <Space h={48} />
                <StreamingSection />
            </ResponsiveContainer>
            <Space h="xl" />
        </div>
    );
}

Shows.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Shows;
