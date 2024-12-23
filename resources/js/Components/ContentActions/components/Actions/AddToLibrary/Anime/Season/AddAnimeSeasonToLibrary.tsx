import { PageProps } from "@/types";
import { useForm, usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, PlusCircle } from "lucide-react";

export default function AddAnimeSeasonToLibrary() {
    const { animeseason } = usePage<PageProps>().props;

    if (!animeseason) return null;

    const { post, processing } = useForm({
        map_id: animeseason.map_id,
        anidb_id: animeseason.id,
    });

    function handleAdd() {
        post(route("anime.season.library.store"), {
            preserveScroll: true,
            onSuccess: (res: any) => {
                if (res.props.flash?.success) {
                    notifications.show({
                        color: "teal",
                        title: "Success",
                        message: res.props.flash.message,
                        icon: <Check size={18} />,
                        autoClose: 3000,
                    });
                }
                if (!res.props.flash?.success) {
                    notifications.show({
                        color: "red",
                        title: "Error",
                        message:
                            res.props.flash?.message ||
                            "Failed to add anime movie to library",
                        icon: <CircleAlertIcon size={18} />,
                        autoClose: 3000,
                    });
                }
            },
            onError: () => {
                notifications.show({
                    color: "red",
                    title: "Error",
                    message:
                        "An error occurred while adding anime movie to library",
                    icon: <CircleAlertIcon size={18} />,
                    autoClose: 3000,
                });
            },
        });
    }

    return (
        <Button
            fullWidth
            variant="outline"
            leftSection={<PlusCircle size={14} />}
            onClick={handleAdd}
            disabled={processing}
        >
            Add to Library
        </Button>
    );
}
