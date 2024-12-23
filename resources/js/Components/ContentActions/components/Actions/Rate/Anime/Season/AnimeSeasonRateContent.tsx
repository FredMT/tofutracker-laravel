import useForm from "@/hooks/useForm";
import { AnimeSeasonUserLibrary, AnimeType, PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, Star } from "lucide-react";
import { AnimeSeason } from "@/types/animeseason";
import { MobileRating } from "@/Components/Content/Shared/MobileRating";
import { DesktopRating } from "@/Components/Content/Shared/DesktopRating";

export default function AnimeSeasonRateContent() {
    const { animeseason, user_library } = usePage<
        PageProps & { type: "animeseason" }
    >().props;

    if (!animeseason) return null;

    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 50em)");

    const { data, setData, post, processing } = useForm({
        anidb_id: (animeseason as AnimeSeason).id,
        map_id: (animeseason as AnimeSeason).map_id,
        rating: (user_library as AnimeSeasonUserLibrary)?.rating ?? 0,
    });

    const submit = () => {
        post(route(`anime.season.library.rate`), {
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
                        message: res.props.flash.message || "An error occurred",
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
        });
    };

    const RatingComponent = isMobile ? MobileRating : DesktopRating;

    return (
        <>
            <RatingComponent
                opened={opened}
                close={close}
                rating={data.rating}
                setRating={(val) => setData("rating", val)}
                title={(animeseason as AnimeSeason).title_main}
                onSubmit={submit}
                processing={processing}
            />

            <Button
                fullWidth
                variant="light"
                leftSection={<Star size={14} />}
                onClick={open}
            >
                {(user_library as AnimeSeasonUserLibrary)?.rating
                    ? `Your rating: ${
                          (user_library as AnimeSeasonUserLibrary).rating
                      }`
                    : `Rate this anime season`}
            </Button>
        </>
    );
}
