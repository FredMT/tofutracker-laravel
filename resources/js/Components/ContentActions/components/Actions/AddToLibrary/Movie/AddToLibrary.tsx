import { useContent } from "@/hooks/useContent";
import { useForm } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, PlusCircle } from "lucide-react";

function AddToLibrary() {
    const { content, type } = useContent();
    if (!content) return null;

    const { post, processing } = useForm({
        movie_id: content.id,
    });

    const handleAdd = () => {
        post(route(`${type}.library.store`, { movie_id: content.id }), {
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
                        message: `An error occurred while trying to add ${content.title} to library`,
                        autoClose: 3000,
                    });
                }
            },
            onError: () => {
                notifications.show({
                    color: "red",
                    title: "Error",
                    icon: <CircleAlertIcon size={18} />,
                    message: `An error occurred while trying to add ${content.title} to library`,
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
