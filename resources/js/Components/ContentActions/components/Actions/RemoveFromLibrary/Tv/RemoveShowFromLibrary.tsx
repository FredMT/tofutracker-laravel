import { useContent } from "@/hooks/useContent";
import { useForm } from "@inertiajs/react";
import { Button, Group, Modal, useModalsStack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, MinusCircle } from "lucide-react";

function RemoveShowFromLibrary() {
    const { content } = useContent();
    if (!content) return null;
    const stack = useModalsStack(["confirm-delete"]);

    const { delete: remove, processing } = useForm({
        show_id: content.id,
    });

    function handleRemove() {
        remove(route("tv.show.library.destroy"), {
            preserveScroll: true,
            onSuccess: (res: any) => {
                stack.closeAll();
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
                            "Failed to remove show from library",
                        icon: <CircleAlertIcon size={18} />,
                        autoClose: 3000,
                    });
                }
            },
            onError: (res: any) => {
                notifications.show({
                    color: "red",
                    title: "Error",
                    message:
                        res.props.flash?.message ||
                        "An error occurred while removing show from library",
                    icon: <CircleAlertIcon size={18} />,
                    autoClose: 3000,
                });
            },
        });
    }

    return (
        <>
            <Modal.Stack>
                <Modal
                    {...stack.register("confirm-delete")}
                    title="Remove Show?"
                    centered
                >
                    Are you sure you want to remove this show from your library?
                    This will also remove all your seasons and episodes!
                    <Group mt="lg" justify="flex-end">
                        <Button
                            onClick={stack.closeAll}
                            variant="default"
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRemove}
                            color="red"
                            loading={processing}
                            disabled={processing}
                        >
                            Remove
                        </Button>
                    </Group>
                </Modal>
            </Modal.Stack>

            <Button
                fullWidth
                variant="outline"
                color="danger"
                leftSection={<MinusCircle size={14} />}
                onClick={() => stack.open("confirm-delete")}
                disabled={processing}
            >
                Remove from Library
            </Button>
        </>
    );
}

export default RemoveShowFromLibrary;
