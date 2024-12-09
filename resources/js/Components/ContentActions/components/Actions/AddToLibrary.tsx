import { PageProps } from "@/types";
import { useForm, usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, PlusCircle } from "lucide-react";

function AddToLibrary() {
    const { type, movie, tv, anime } = usePage<PageProps>().props;
    const content = type === "movie" ? movie : type === "tv" ? tv : anime;
    if (!content) return null;

    const { post, processing } = useForm({
        media_id: content.id,
        media_type: type,
        status: "COMPLETED",
    });

    const handleAdd = () => {
        post(route(`${type}.library.add`, content.id), {
            preserveScroll: true,
            onSuccess: () => {
                notifications.show({
                    color: "teal",
                    title: "Success",
                    message: `${content.title} added to library`,
                    icon: <Check size={18} />,
                    autoClose: 3000,
                });
            },
            onError: () => {
                notifications.show({
                    color: "red",
                    title: "Error",
                    icon: <CircleAlertIcon size={18} />,
                    message: "An error occurred",
                    autoClose: 3000,
                });
            },
        });
    };

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

export default AddToLibrary;
