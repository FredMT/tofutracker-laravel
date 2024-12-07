import styles from "./UserImage.module.css";

interface ImageProps {
    alt?: string;
    className?: string;
}

export default function UserImage({
    alt = "Movie poster",
    className,
}: ImageProps) {
    return (
        <img
            src="https://image.tmdb.org/t/p/original/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg"
            alt={alt}
            className={`${styles.image} ${className || ""}`}
        />
    );
}
