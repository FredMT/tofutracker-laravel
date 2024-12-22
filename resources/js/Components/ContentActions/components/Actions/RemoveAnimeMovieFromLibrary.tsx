import { useContent } from "@/hooks/useContent";
import { useForm } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, Trash2 } from "lucide-react";

function RemoveAnimeMovieFromLibrary() {
    const { content } = useContent();
    if (!content) return null;

    const { delete: destroy, processing } = useForm({
        anidb_id: content.anidb_id,
        map_id: content.map_id,
    });

    function handleRemove() {
        destroy(route("anime.movie.library.destroy"), {
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
                            "Failed to remove anime movie from library",
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
                        "An error occurred while removing anime movie from library",
                    icon: <CircleAlertIcon size={18} />,
                    autoClose: 3000,
                });
            },
        });
    }

    return (
        <Button
            fullWidth
            color="red"
            variant="outline"
            leftSection={<Trash2 size={14} />}
            onClick={handleRemove}
            disabled={processing}
        >
            Remove from Library
        </Button>
    );
}

export default RemoveAnimeMovieFromLibrary;
