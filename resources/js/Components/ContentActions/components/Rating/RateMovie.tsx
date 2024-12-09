import { Button } from "@mantine/core";
import { Check, CircleAlertIcon, Star } from "lucide-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { MoviePageProps, PageProps } from "@/types";
import { MobileRating } from "@/Components/ContentActions/components/Rating/MobileRating";
import { DesktopRating } from "@/Components/ContentActions/components/Rating/DesktopRating";
import useForm from "@/hooks/useForm";
import { notifications } from "@mantine/notifications";

export function RateMovie() {
    const { user_library, movie, flash } =
        usePage<PageProps<MoviePageProps>>().props;
    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 50em)");

    const { data, setData, post, processing } = useForm({
        rating: user_library?.rating ?? 0,
    });

    const submit = () => {
        post(route("movie.library.update-rating", movie.id), {
            preserveScroll: true,
            onSuccess: (res: any) => {
                if (res?.props?.flash?.success) {
                    notifications.show({
                        color: "teal",
                        title: "Success",
                        message: res?.props?.flash?.message,
                        icon: <Check size={18} />,
                        autoClose: 3000,
                    });
                }
            },
            onError: (res: any) => {
                if (!res?.props?.flash?.success) {
                    notifications.show({
                        color: "red",
                        icon: <CircleAlertIcon size={18} />,
                        title: "Error",
                        message:
                            res?.props?.flash?.message || "An error occurred",
                        autoClose: 3000,
                    });
                }
            },
        });
    };

    return (
        <>
            {isMobile ? (
                <MobileRating
                    opened={opened}
                    close={close}
                    rating={data.rating}
                    setRating={(val) => setData("rating", val)}
                    movie={movie}
                    onSubmit={submit}
                    processing={processing}
                />
            ) : (
                <DesktopRating
                    opened={opened}
                    close={close}
                    rating={data.rating}
                    setRating={(val) => setData("rating", val)}
                    movie={movie}
                    onSubmit={submit}
                    processing={processing}
                />
            )}

            <Button
                fullWidth
                variant="light"
                leftSection={<Star size={14} />}
                onClick={open}
            >
                {`${
                    user_library?.rating
                        ? `Your rating: ${user_library.rating}`
                        : "Rate this movie"
                }`}
            </Button>
        </>
    );
}
