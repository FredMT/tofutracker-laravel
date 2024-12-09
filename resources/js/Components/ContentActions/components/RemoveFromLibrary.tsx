import { MoviePageProps, PageProps } from "@/types";
import { useForm, usePage } from "@inertiajs/react";
import { Button, Group, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, MinusCircle } from "lucide-react";
import { useModalsStack } from "@mantine/core";

function RemoveFromLibrary() {
    const { movie, flash } = usePage<PageProps<MoviePageProps>>().props;
    const stack = useModalsStack(["confirm-delete"]);

    const { delete: remove, processing } = useForm({
        movie_id: movie.id,
    });

    function handleRemove() {
        remove(route("movie.library.remove", movie.id), {
            preserveScroll: true,
            onSuccess: () => {
                stack.closeAll();
                if (flash.success) {
                    notifications.show({
                        color: "teal",
                        title: "Success",
                        message: `${movie.title} deleted from library`,
                        icon: <Check size={18} />,
                        autoClose: 3000,
                    });
                }
            },
            onError: () => {
                stack.closeAll();
                if (!flash.success) {
                    notifications.show({
                        color: "red",
                        icon: <CircleAlertIcon size={18} />,
                        title: "Error",
                        message: "An error occurred",
                        autoClose: 3000,
                    });
                }
            },
        });
    }

    return (
        <>
            <Modal.Stack>
                <Modal
                    {...stack.register("confirm-delete")}
                    title={`Remove ${movie.title}?`}
                >
                    Are you sure you want to remove this movie from your
                    library?
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
