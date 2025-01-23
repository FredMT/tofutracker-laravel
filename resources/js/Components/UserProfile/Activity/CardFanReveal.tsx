import { AspectRatio, Image } from "@mantine/core";
import { Link } from "@inertiajs/react";
import styles from "./CardFanReveal.module.css";
import { useHover } from "@mantine/hooks";

interface ListItem {
    id: number;
    type: string;
    title: string;
    link: string;
    poster_path: string | null;
    poster_type: string;
}

interface CardFanRevealProps {
    items: ListItem[];
}

const getImageUrl = (item: ListItem): string | null => {
    if (!item.poster_path) return null;

    switch (item.poster_type) {
        case "tmdb":
            return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        case "anidb":
            return `https://anidb.net/images/main/${item.poster_path}`;
        case "tvdb":
            return `https://artworks.thetvdb.com${item.poster_path}`;
        default:
            return null;
    }
};

const PlaceholderImage = () => (
    <div className={styles.placeholder}>
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 40 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
        >
            <rect width="100%" height="100%" />
        </svg>
    </div>
);

export function CardFanReveal({ items }: CardFanRevealProps) {
    const { hovered, ref } = useHover();
    const displayItems = items.slice(0, 3);

    return (
        <div ref={ref} className={styles.container} data-hovered={hovered}>
            {displayItems.map((item, index) => (
                <Link
                    key={item.id}
                    href={item.link}
                    className={styles.cardWrapper}
                    style={{
                        zIndex: displayItems.length - index,
                        transform: hovered
                            ? `translateX(${(index - 1) * 35}px) rotate(${
                                  (index - 1) * 15
                              }deg)`
                            : `translateX(${(index - 1) * 2}px) rotate(${
                                  (index - 1) * 3
                              }deg)`,
                    }}
                >
                    {item.poster_path ? (
                        <AspectRatio ratio={2 / 3} w={67}>
                            <Image
                                src={getImageUrl(item)}
                                alt={item.title}
                                radius="md"
                                fit="cover"
                                className={styles.image}
                            />
                        </AspectRatio>
                    ) : (
                        <PlaceholderImage />
                    )}
                </Link>
            ))}
        </div>
    );
}
