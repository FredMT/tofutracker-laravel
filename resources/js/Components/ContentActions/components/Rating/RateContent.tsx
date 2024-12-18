import { useContent } from "@/hooks/useContent";
import useForm from "@/hooks/useForm";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, Star } from "lucide-react";
import { DesktopRating } from "./DesktopRating";
import { MobileRating } from "./MobileRating";

export function RateContent() {
    const { user_library } = usePage<PageProps>().props;
    const { content, type } = useContent();
    if (!content) return null;
    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 50em)");

    const { data, setData, post, processing } = useForm({
        rating: user_library?.rating ?? 0,
    });

    const getRouteParams = () => {
        switch (type) {
            case "movie":
                return { movie_id: content.id };
            case "tv":
                return { tv_id: content.id };
            case "tvseason":
                return {
                    show_id: content.show_id,
                    season_id: content.id,
                };
        }
    };

    const submit = () => {
        post(route(`${type}.library.rate`, getRouteParams()), {
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

    const getContentType = () => {
        switch (type) {
            case "movie":
                return "movie";
            case "tv":
                return "show";
            case "tvseason":
                return "season";
        }
    };

    return (
        <>
            <RatingComponent
                opened={opened}
                close={close}
                rating={data.rating}
                setRating={(val) => setData("rating", val)}
                content={content}
                onSubmit={submit}
                processing={processing}
            />

            <Button
                fullWidth
                variant="light"
                leftSection={<Star size={14} />}
                onClick={open}
            >
                {user_library?.rating
                    ? `Your rating: ${user_library.rating}`
                    : `Rate this ${getContentType()}`}
            </Button>
        </>
    );
}
