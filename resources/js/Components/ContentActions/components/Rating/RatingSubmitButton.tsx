import { AnimeUserLibrary, BaseUserLibrary, ContentType } from "@/types";
import { usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";

interface RatingSubmitButtonProps {
    rating: number;
    processing: boolean;
}

export function RatingSubmitButton({
    rating,
    processing,
}: RatingSubmitButtonProps) {
    const { user_library, type } = usePage<{
        user_library: BaseUserLibrary | AnimeUserLibrary;
        type: ContentType;
    }>().props;

    const getCurrentRating = () => {
        if (!user_library) return null;

        if (["movie", "tv", "tvseason", "animeseason"].includes(type)) {
            return (user_library as BaseUserLibrary).rating;
        }

        if (["animemovie", "animetv"].includes(type)) {
            return (user_library as AnimeUserLibrary).collection.rating;
        }

        return null;
    };

    const currentRating = getCurrentRating();

    const getButtonText = () => {
        if (rating === currentRating) {
            return `You have already rated this as ${rating}`;
        }

        return currentRating ? "Update" : "Rate";
    };

    return (
        <Button
            w={350}
            type="submit"
            disabled={processing || !rating || rating === currentRating}
        >
            {getButtonText()}
        </Button>
    );
}
