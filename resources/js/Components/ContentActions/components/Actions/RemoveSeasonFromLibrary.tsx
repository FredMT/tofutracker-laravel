import { PageProps } from "@/types";
import { useForm, usePage } from "@inertiajs/react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon, Trash2 } from "lucide-react";

function RemoveSeasonFromLibrary() {
    const { tvseason } = usePage<PageProps>().props;
    if (!tvseason) return null;

    const { delete: destroy, processing } = useForm({
        show_id: tvseason.show_id,
        season_id: tvseason.id,
    });

    const handleRemove = () => {
        destroy(route("tv.season.library.destroy"), {
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
                        message: `${res.props.flash.message}`,
                        autoClose: 3000,
                    });
                }
            },
            onError: () => {
                notifications.show({
                    color: "red",
                    title: "Error",
                    icon: <CircleAlertIcon size={18} />,
                    message: `An error occurred while trying to remove season from library`,
                    autoClose: 3000,
                });
            },
        });
    };

    return (
        <Button
            fullWidth
            color="red"
            variant="outline"
            leftSection={<Trash2 size={14} />}
            onClick={handleRemove}
            disabled={processing}
        >
            Remove Season from Library
        </Button>
    );
}

export default RemoveSeasonFromLibrary;
