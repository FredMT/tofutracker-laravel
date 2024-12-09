import { Star } from "lucide-react";

interface RatingStarProps {
    rating: number;
}

export function RatingStar({ rating }: RatingStarProps) {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1001,
                width: `${80 + rating * 4}px`,
                height: `${80 + rating * 4}px`,
                transition: "all 0.3s ease",
            }}
        >
            <Star
                fill="#FFD700"
                color="#FFD700"
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
            <span
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#000",
                    fontSize: `${20 + rating * 0.5}px`,
                    fontWeight: "bold",
                }}
            >
                {rating || "?"}
            </span>
        </div>
    );
}
