import { MoviePageProps, PageProps } from "@/types";
import { useForm, usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, PlusCircle } from "lucide-react";

function AddToLibrary() {
    const { movie, flash } = usePage<PageProps<MoviePageProps>>().props;

    const { post, processing } = useForm({
        movie_id: movie.id,
        status: "COMPLETED",
    });

    const handleAdd = () => {
        post(route("movie.library.add", movie.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (flash.success) {
                    notifications.show({
                        color: "teal",
                        title: "Success",
                        message: `${movie.title} added to library`,
                        icon: <Check size={18} />,
                        autoClose: 3000,
                    });
                }
            },
            onError: () => {
                if (!flash.success) {
                    notifications.show({
                        color: "red",
                        title: "Error",
                        icon: <CircleAlertIcon size={18} />,
                        message: "An error occurred",
                        autoClose: 3000,
                    });
                }
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
