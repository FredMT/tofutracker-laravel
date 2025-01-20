import {useForm, usePage} from "@inertiajs/react";
import {Button, Group, Modal, useModalsStack} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {Check, CircleAlertIcon, Trash2} from "lucide-react";
import {AnimeType} from "@/types";
import {AnimeSeason} from "@/types/animeseason";

export default function RemoveAnimeSeasonFromLibrary() {
    const {type, data: content} = usePage<{type: AnimeType, data: AnimeSeason}>().props
    if (!content || type !== "animeseason") return null;
    const stack = useModalsStack(["confirm-delete"]);

    const { delete: destroy, processing } = useForm({
        anidb_id: content.id,
    });

    function handleRemove() {
        destroy(route("anime.season.library.destroy"), {
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
                            "Failed to remove anime season from library",
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
                        "An error occurred while removing anime season from library",
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
                    title="Remove from Library?"
                    centered
                >
                    Are you sure you want to remove this content from your
                    library? This will also remove all your episode activity for
                    this content.
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
                color="red"
                variant="outline"
                leftSection={<Trash2 size={14} />}
                onClick={() => stack.open("confirm-delete")}
                disabled={processing}
            >
                Remove from Library
            </Button>
        </>
    );
}
