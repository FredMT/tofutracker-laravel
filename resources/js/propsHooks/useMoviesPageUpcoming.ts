import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";

interface UpcomingMovie {
    id: number;
    title: string;
    poster: string;
    year: string;
    rating: string;
}

export function useMoviesPageUpcoming() {
    const props = useTypedPageProps();
    return props.upcoming as unknown as UpcomingMovie[];
}
