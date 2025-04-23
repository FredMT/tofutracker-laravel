import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";

interface PopularMovie {
    id: number;
    title: string;
    logo: string | null;
    backdrop: string | null;
    overview: string;
    poster: string;
    year: string;
    genres: string[];
    rating: string;
}

export function useMoviesPagePopular() {
    const props = useTypedPageProps();
    return props.popular as unknown as PopularMovie[];
}
