import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";

interface NowPlayingMovie {
    id: number;
    title: string;
    poster: string;
    year: string;
    rating: string;
}

export function useMoviesPageNowPlaying() {
    const props = useTypedPageProps();
    return props.now_playing as unknown as NowPlayingMovie[];
}
