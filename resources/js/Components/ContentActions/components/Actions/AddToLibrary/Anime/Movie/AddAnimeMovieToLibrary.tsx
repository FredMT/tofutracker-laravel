import {useForm, usePage} from "@inertiajs/react";
import {Button} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {Check, CircleAlertIcon, PlusCircle} from "lucide-react";
import {Anime} from "@/types/anime";

function AddAnimeMovieToLibrary() {
    const { data: content } = usePage<{data: Anime}>().props
    if (!content) return null;

    const { post, processing } = useForm({
        anidb_id: content.anidb_id,
        map_id: content.map_id,
    });

    function handleAdd() {
        post(route("anime.movie.library.store"), {
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

export default AddAnimeMovieToLibrary;
