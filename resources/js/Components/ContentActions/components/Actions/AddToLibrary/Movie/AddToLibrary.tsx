import { useForm, usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, PlusCircle } from "lucide-react";
import { Movie } from "@/types";

function AddToLibrary() {
    const { type, data } = usePage<{ type: "movie"; data: Movie }>().props;

    const { post, processing } = useForm({
        movie_id: data.id,
    });

    const handleAdd = () => {
        post(route(`${type}.library.store`), {
            preserveScroll: true,
            onSuccess: (res: any) => {
                if (res.props.flash.success) {
                    notifications.show({
                        color: "teal",
                        title: "Success",
                        message: `${res.props.flash.message}`,
                        icon: <Check size={18} />,
                        autoClose: 3000,
                    });
                }
                if (!res.props.flash.success) {
                    notifications.show({
                        color: "red",
                        title: "Error",
                        icon: <CircleAlertIcon size={18} />,
                        message: `An error occurred while trying to add ${data.title} to library`,
                        autoClose: 3000,
                    });
                }
            },
            onError: () => {
                notifications.show({
                    color: "red",
                    title: "Error",
                    icon: <CircleAlertIcon size={18} />,
                    message: `An error occurred while trying to add ${data.title} to library`,
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
