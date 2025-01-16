import {Image} from "@mantine/core";
import {useState} from "react";
import classes from "./ListBanner.module.css";
import {Auth} from "@/types";
import {usePage} from "@inertiajs/react";
import {BannerActions} from "@/Components/List/BannerActions/BannerActions";

interface BannerProps {
    bannerImage: string | null;
    bannerType: "custom" | "tmdb";
    listUserUsername: string;
    listId: number;
}

export function ListBanner({
    bannerImage,
    bannerType,
    listUserUsername,
    listId,
}: BannerProps) {
    const auth = usePage<{ auth: Auth }>().props.auth;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageSelect = (file: File) => {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleImageUrlSelect = (url: string) => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleCancel = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const displayedImage =
        previewUrl ||
        (bannerImage
            ? bannerType === "custom"
                ? `https://images.tofutracker.com/${bannerImage}`
                : `https://image.tmdb.org/t/p/w780${bannerImage}`
            : null);

    return (
        <div className={classes.container}>
            <div className={classes.imageContainer}>
                {displayedImage ? (
                    <Image
                        className={classes.banner}
                        src={displayedImage}
                        alt="List banner"
                        fit="cover"
                    />
                ) : (
                    <div className={classes.bannerPlaceholder} />
                )}
                {auth && auth.user?.username === listUserUsername && (
                    <BannerActions
                        listId={listId}
                        onImageSelect={handleImageSelect}
                        onImageUrlSelect={handleImageUrlSelect}
                        hasSelectedImage={!!selectedFile}
                        selectedFile={selectedFile}
                        onCancel={handleCancel}
                        hasBanner={!!bannerImage}
                    />
                )}
            </div>
        </div>
    );
}
