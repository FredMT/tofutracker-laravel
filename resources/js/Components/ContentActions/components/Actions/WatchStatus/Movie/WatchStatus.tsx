import { BaseUserLibrary, RegularContentDataType, RegularType } from "@/types";
import { WatchStatus } from "@/types/enums";
import { useForm, usePage } from "@inertiajs/react";
import { Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon } from "lucide-react";
import { useEffect } from "react";

type WatchStatusSelectProps = {
    type: RegularType;
    data: RegularContentDataType;
    user_library: BaseUserLibrary;
};

export function MovieWatchStatusSelect() {
    const {
        type,
        data: content,
        user_library,
    } = usePage<WatchStatusSelectProps>().props;
    if (!content) return null;

    const statusOptions = Object.values(WatchStatus).map((status) => ({
        value: status,
        label: status,
        disabled: status === user_library?.watch_status,
    }));

    const getIDFields = () => {
        if (type === "movie") return { movie_id: content.id };
        if (type === "tvseason")
            return { season_id: content.id, show_id: content.show_id };
        return {};
    };

    const { data, patch, setData, processing } = useForm({
        watch_status: (user_library?.watch_status as WatchStatus) ?? null,
        ...getIDFields(),
    });

    useEffect(() => {
        setData(
            "watch_status",
            (user_library?.watch_status as WatchStatus) ?? null
        );
    }, [user_library]);

    useEffect(() => {
        if (
            data.watch_status &&
            data.watch_status !== user_library?.watch_status
        ) {
            patch(
                route(
                    type === "movie"
                        ? "movie.watch_status"
                        : "tv.season.watch_status"
                ),
                {
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
                                    res.props.flash.message ||
                                    "An error occurred",
                                autoClose: 3000,
                            });
                        }
                    },
                    onError: (res: any) => {
                        notifications.show({
                            color: "red",
                            icon: <CircleAlertIcon size={18} />,
                            title: "Error",
                            message:
                                res.props.flash.message || "An error occurred",
                            autoClose: 3000,
                        });
                    },
                }
            );
        }
    }, [data.watch_status]);

    const getPlaceholder = () => {
        switch (type) {
            case "movie":
                return "Choose Movie Status";
            case "tvseason":
                return "Choose Season Status";
            default:
                return "Choose Status";
        }
    };

    return (
        <Select
            placeholder={getPlaceholder()}
            data={statusOptions}
            value={data.watch_status}
            onChange={(val) => setData("watch_status", val as WatchStatus)}
            clearable={false}
            disabled={processing}
        />
    );
}
