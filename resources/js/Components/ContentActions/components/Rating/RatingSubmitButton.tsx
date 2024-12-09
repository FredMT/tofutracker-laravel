import { MoviePageProps, PageProps } from "@/types";
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
    const { user_library } = usePage<PageProps<MoviePageProps>>().props;

    const getButtonText = () => {
        if (rating === user_library?.rating) {
            return `You have already rated this movie as ${rating}`;
        }

        return user_library?.rating ? "Update" : "Rate";
    };

    return (
        <Button
            w={350}
            type="submit"
            disabled={processing || !rating || rating === user_library?.rating}
        >
            {getButtonText()}
        </Button>
    );
}
