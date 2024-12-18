import { useContent } from "@/hooks/useContent";
import { PageProps } from "@/types";
import { WatchStatus } from "@/types/enums";
import { useForm, usePage } from "@inertiajs/react";
import { Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon } from "lucide-react";
import { useEffect } from "react";

export function WatchStatusSelect() {
    const { user_library } = usePage<PageProps>().props;
    const { content } = useContent();
    if (!content) return null;

    const statusOptions = Object.values(WatchStatus).map((status) => ({
        value: status,
        label: status,
        disabled: status === user_library?.watch_status,
    }));

    const { data, patch, setData, processing } = useForm({
        watch_status: (user_library?.watch_status as WatchStatus) ?? null,
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
                route("movie.library.update-status", { movie_id: content.id }),
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
                    },
                    onError: (res: any) => {
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
                }
            );
        }
    }, [data.watch_status]);

    return (
        <Select
            placeholder="Choose Status"
            data={statusOptions}
            value={data.watch_status}
            onChange={(val) => setData("watch_status", val as WatchStatus)}
            clearable={false}
            disabled={processing}
        />
    );
}
