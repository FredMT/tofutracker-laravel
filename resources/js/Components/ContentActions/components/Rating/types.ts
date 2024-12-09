export interface RatingProps {
    opened: boolean;
    close: () => void;
    processing: boolean;
    rating: number;
    setRating: (rating: number) => void;
    movie: {
        title: string;
    };
}
