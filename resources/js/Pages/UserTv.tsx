import BadgeBox from "@/Components/Shared/BadgeBox";
import TvCard from "@/Components/Shared/TvCard";
import FilterDesktop from "@/Components/UserProfile/Filter/FilterDesktop";
import FilterMobile from "@/Components/UserProfile/Filter/FilterMobile";
import FilterSearchInput from "@/Components/UserProfile/Filter/FilterSearchInput";
import UserMovieLayout from "@/Components/UserProfile/UserMovieLayout";
import UserMovieSection from "@/Components/UserProfile/UserMovieSection";
import { useFilterStore } from "@/hooks/useFilterStore";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { PageProps } from "@/types/userMovies";
import { UserTvShow } from "@/types/userTv";
import { Head } from "@inertiajs/react";
import { Box, Space, Stack, Text, Title } from "@mantine/core";
import { useEffect } from "react";

const show: UserTvShow = {
    id: 1399,
    title: "Game of Thrones",
    poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    release_date: 2011,
    rating: 9,
    watch_status: "COMPLETED",
    added_at: "21 December, 2024",
    total_seasons: 8,
    user_total_seasons: 8,
    seasons: [
        {
            id: 3624,
            title: "Season 1",
            poster_path: "/wgfKiqzuMrFIkU1M68DDDY8kGC1.jpg",
            release_date: 2011,
            rating: 2,
            watch_status: "COMPLETED",
            added_at: "23 December, 2024",
            season_number: 1,
            watched_episodes: 10,
            total_episodes: 10,
        },
        {
            id: 3625,
            title: "Season 2",
            poster_path: "/oJsbD246bI5BldpfQypX9lMRypa.jpg",
            release_date: 2012,
            rating: null,
            watch_status: "COMPLETED",
            added_at: "22 December, 2024",
            season_number: 2,
            watched_episodes: 9,
            total_episodes: 10,
        },
        {
            id: 3626,
            title: "Season 3",
            poster_path: "/eVWAat0GqF6s5LLThrI7ClpKr96.jpg",
            release_date: 2013,
            rating: null,
            watch_status: "COMPLETED",
            added_at: "23 December, 2024",
            season_number: 3,
            watched_episodes: 10,
            total_episodes: 10,
        },
        {
            id: 3628,
            title: "Season 4",
            poster_path: "/jXIMScXE4J4EVHUba1JgxZnWbo4.jpg",
            release_date: 2014,
            rating: null,
            watch_status: "COMPLETED",
            added_at: "23 December, 2024",
            season_number: 4,
            watched_episodes: 10,
            total_episodes: 10,
        },
        {
            id: 62090,
            title: "Season 5",
            poster_path: "/7Q1Hy1AHxAzA2lsmzEMBvuWTX0x.jpg",
            release_date: 2015,
            rating: null,
            watch_status: "COMPLETED",
            added_at: "23 December, 2024",
            season_number: 5,
            watched_episodes: 10,
            total_episodes: 10,
        },
        {
            id: 71881,
            title: "Season 6",
            poster_path: "/p1udLh0gfqyZFmXBGa393gk8go5.jpg",
            release_date: 2016,
            rating: null,
            watch_status: "COMPLETED",
            added_at: "23 December, 2024",
            season_number: 6,
            watched_episodes: 10,
            total_episodes: 10,
        },
        {
            id: 81266,
            title: "Season 7",
            poster_path: "/oX51n32QyHeFP5kErksemJsJljL.jpg",
            release_date: 2017,
            rating: null,
            watch_status: "COMPLETED",
            added_at: "23 December, 2024",
            season_number: 7,
            watched_episodes: 7,
            total_episodes: 7,
        },
        {
            id: 107971,
            title: "Season 8",
            poster_path: "/259Q5FuaD3TNB7DGauTaJVRC8XV.jpg",
            release_date: 2019,
            rating: null,
            watch_status: "COMPLETED",
            added_at: "23 December, 2024",
            season_number: 8,
            watched_episodes: 6,
            total_episodes: 6,
        },
    ],
};

function UserTv({ userData, filters }: PageProps) {
    const filterStore = useFilterStore();

    useEffect(() => {
        if (filters) {
            filterStore.setStatus(filters.status || null);
            filterStore.setTitle(filters.title || null);
            filterStore.setDateRange([
                filters.from_date ? new Date(filters.from_date) : null,
                filters.to_date ? new Date(filters.to_date) : null,
            ]);
            filterStore.setGenres(
                filters.genres ? filters.genres.split(",").map(Number) : []
            );
        }
    }, []);

    return (
        <>
            <Head title={`${userData.username}'s Movies`} />
            <Space h={50} />
            <TvCard show={show} />
            <Space h={200} />
        </>
    );
}

UserTv.layout = (page: any) => (
    <AuthenticatedLayout>
        <UserProfileLayout children={page} userData={page.props.userData} />
    </AuthenticatedLayout>
);

export default UserTv;
