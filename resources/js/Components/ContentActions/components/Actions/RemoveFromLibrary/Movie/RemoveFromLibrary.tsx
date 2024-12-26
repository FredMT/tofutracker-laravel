import { useContent } from "@/hooks/useContent";
import { useForm } from "@inertiajs/react";
import { Button, Group, Modal, useModalsStack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, MinusCircle } from "lucide-react";

function RemoveFromLibrary() {
    const { content, type } = useContent();
    if (!content) return null;
    const stack = useModalsStack(["confirm-delete"]);

    const { delete: remove, processing } = useForm({
        movie_id: content.id,
    });

    function handleRemove() {
        remove(route(`${type}.library.destroy`, { movie_id: content.id }), {
            preserveScroll: true,
            onSuccess: (res: any) => {
                stack.closeAll();
                if (res.props.flash?.success) {
                    notifications.show({
                        color: "teal",
                        title: "Success",
                        message: `${content?.title} removed from library`,
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
                            `Failed to remove ${content?.title} from library`,
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
                        `An error occurred while removing ${content?.title} from library`,
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
                    title={`Remove ${content.title}?`}
                    centered
                >
                    Are you sure you want to remove this item from your library?
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

export default RemoveFromLibrary;