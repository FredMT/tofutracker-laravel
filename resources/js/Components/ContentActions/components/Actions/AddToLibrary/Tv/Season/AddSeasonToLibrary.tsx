import {TvSeason} from "@/types";
import {useForm, usePage} from "@inertiajs/react";
import {Button} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {Check, CircleAlertIcon, PlusCircle} from "lucide-react";

function AddSeasonToLibrary() {
    const { data: content } = usePage<{data: TvSeason}>().props;

    if (!content) return null;

    const { post, processing } = useForm({
        show_id: content.show_id,
        season_id: content.id,
    });

    const handleAdd = () => {
        post(route("tv.season.library.store"), {
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
                    message: `An error occurred while trying to add season to library`,
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
            Add Season to Library
        </Button>
    );
}

export default AddSeasonToLibrary;
