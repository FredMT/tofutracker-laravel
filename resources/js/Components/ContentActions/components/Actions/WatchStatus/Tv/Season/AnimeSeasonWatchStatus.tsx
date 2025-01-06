import { useContent } from "@/hooks/useContent";
import { AnimeSeasonUserLibrary, AnimeType, PageProps } from "@/types";
import { WatchStatus } from "@/types/enums";
import { useForm, usePage } from "@inertiajs/react";
import { Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon } from "lucide-react";
import { useEffect } from "react";
import {AnimeSeason} from "@/types/animeseason";

type AnimeSeasonWatchStatus = {
    data: AnimeSeason;
    user_library: AnimeSeasonUserLibrary;
    type: AnimeType;
}
export default function AnimeSeasonWatchStatus() {
    const { user_library, data: content, type } = usePage<AnimeSeasonWatchStatus>().props;
    if (!content || type !== "animeseason" ) return null;

    const statusOptions = Object.values(WatchStatus).map((status) => ({
        value: status,
        label: status,
        disabled: user_library?.watch_status === status,
    }));

    const { data, patch, setData, processing } = useForm({
        anidb_id: content.id,
        map_id: content.map_id,
        watch_status:
            (user_library as AnimeSeasonUserLibrary | null)?.watch_status ??
            null,
    });

    useEffect(() => {
        setData(
            "watch_status",
            (user_library as AnimeSeasonUserLibrary | null)?.watch_status ??
                null
        );
    }, [user_library]);

    useEffect(() => {
        if (
            data.watch_status &&
            data.watch_status !==
                (user_library as AnimeSeasonUserLibrary | null)?.watch_status
        ) {
            patch(route("anime.season.library.update-status"), {
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
