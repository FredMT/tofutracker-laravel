import { DesktopRating } from "@/Components/Content/Shared/DesktopRating";
import { MobileRating } from "@/Components/Content/Shared/MobileRating";
import useForm from "@/hooks/useForm";
import { AnimeType, AnimeUserLibrary } from "@/types";
import { Anime } from "@/types/anime";
import { usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, Star } from "lucide-react";

export default function AnimeRateContent() {
    const {
        type,
        data: anime,
        user_library,
    } = usePage<{
        type: AnimeType;
        data: Anime;
        user_library: AnimeUserLibrary;
    }>().props;

    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 50em)");

    const { data, setData, post, processing } = useForm({
        rating: user_library?.collection.rating ?? 0,
    });

    const getRouteParams = () => {
        switch (type) {
            case "animemovie":
                return {
                    anidb_id: anime.anidb_id,
                    map_id: anime.map_id,
                };
            case "animetv":
                return { map_id: anime.map_id };
            default:
                throw new Error("Invalid anime type");
        }
    };

    const submit = () => {
        post(
            route(
                `${
                    type === "animemovie" ? "anime.movie" : "anime.tv"
                }.library.rate`,
                getRouteParams()
            ),
            {
                preserveScroll: true,
                onSuccess: (res: any) => {
                    if (res.props.flash.success) {
                        notifications.show({
                            color: "teal",
                            title: "Success",
                            message: res?.props?.flash?.message,
                            icon: <Check size={18} />,
                            autoClose: 3000,
                        });
                    }
                    if (!res.props.flash.success) {
                        notifications.show({
                            color: "red",
                            icon: <CircleAlertIcon size={18} />,
                            title: "Error",
                            message:
                                res.props.flash.message || "An error occurred",
                            autoClose: 3000,
                        });
                    }
                },
                onError: (res: any) => {
                    notifications.show({
                        color: "red",
                        icon: <CircleAlertIcon size={18} />,
                        title: "Error",
                        message: res.props.flash.message || "An error occurred",
                        autoClose: 3000,
                    });
                },
            }
        );
    };

    const RatingComponent = isMobile ? MobileRating : DesktopRating;

    const getContentType = () => {
        switch (type) {
            case "animemovie":
                return "movie";
            case "animetv":
                return "anime";
        }
    };

    return (
        <>
            <RatingComponent
                opened={opened}
                close={close}
                rating={data.rating}
                setRating={(val) => setData("rating", val)}
                title={anime.collection_name}
                onSubmit={submit}
                processing={processing}
            />

            <Button
                fullWidth
                variant="light"
                leftSection={<Star size={14} />}
                onClick={open}
            >
                {user_library?.collection.rating
                    ? `Your rating: ${user_library.collection.rating}`
                    : `Rate this ${getContentType()}`}
            </Button>
        </>
    );
}
