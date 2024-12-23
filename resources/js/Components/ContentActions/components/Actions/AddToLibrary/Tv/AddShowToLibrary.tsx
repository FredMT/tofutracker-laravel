import { useContent } from "@/hooks/useContent";
import { useForm } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, PlusCircle } from "lucide-react";

function AddShowToLibrary() {
    const { content } = useContent();
    if (!content) return null;

    const { post, processing } = useForm({
        show_id: content.id,
    });

    function handleAdd() {
        post(route("tv.show.library.store"), {
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
                            "Failed to add show to library",
                        icon: <CircleAlertIcon size={18} />,
                        autoClose: 3000,
                    });
                }
            },
            onError: () => {
                notifications.show({
                    color: "red",
                    title: "Error",
                    message: "An error occurred while adding show to library",
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

export default AddShowToLibrary;
