import {Movie, TvShow} from "@/types";

export type Content = Movie | TvShow;

export interface RatingProps {
    opened: boolean;
    close: () => void;
    rating: number;
    setRating: (value: number) => void;
    title: string;
    processing: boolean;
}
