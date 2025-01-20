import {AnimeUserLibrary} from "@/types";
import {WatchStatus} from "@/types/enums";
import {useForm, usePage} from "@inertiajs/react";
import {Select} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {Check, CircleAlertIcon} from "lucide-react";
import {useEffect} from "react";
import {Anime} from "@/types/anime";

type AnimeMovieWatchStatus = {
    user_library: AnimeUserLibrary;
    data: Anime;
}
export default function AnimeMovieWatchStatus() {
    const { user_library, data: content } = usePage<AnimeMovieWatchStatus>().props;
    if (!content) return null;

    const statusOptions = Object.values(WatchStatus).map((status) => ({
        value: status,
        label: status,
        disabled: status === user_library?.collection.watch_status,
    }));

    const { data, patch, setData, processing } = useForm({
        map_id: content.map_id,
        anidb_id: content.anidb_id,
        watch_status:
            (user_library?.collection.watch_status as WatchStatus) ?? null,
    });

    useEffect(() => {
        setData(
            "watch_status",
            (user_library?.collection.watch_status as WatchStatus) ?? null
        );
    }, [user_library]);

    useEffect(() => {
        if (
            data.watch_status &&
            data.watch_status !== user_library?.collection.watch_status
        ) {
            patch(route("animemovie.library.update-status"), {
                preserveScroll: true,
                onSuccess: (res: any) => {
                    if (res.props.flash.success) {
                        notifications.show({
                            color: "teal",
                            title: "Success",
                            message: res.props.flash.message,
                            icon: <Check size={18} />,
                            autoClose: 3000,
                        });
                    }
                    if (!res.props.flash.success) {
                        notifications.show({
                            color: "red",
                            icon: <CircleAlertIcon size={18} />,
                            title: "Error",
                            message:
                                res.props.flash.message || "An error occurred",
                            autoClose: 3000,
                        });
                    }
                },
                onError: () => {
                    notifications.show({
                        color: "red",
                        icon: <CircleAlertIcon size={18} />,
                        title: "Error",
                        message: "An error occurred",
                        autoClose: 3000,
                    });
                },
            });
        }
    }, [data.watch_status]);

    return (
        <Select
            placeholder="Choose Show Status"
            data={statusOptions}
            value={data.watch_status}
            onChange={(val) => setData("watch_status", val as WatchStatus)}
            clearable={false}
            disabled={processing}
        />
    );
}
