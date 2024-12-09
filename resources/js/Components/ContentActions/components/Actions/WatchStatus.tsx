import { PageProps } from "@/types";
import { WatchStatus } from "@/types/enums";
import { useForm, usePage } from "@inertiajs/react";
import { Divider, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon } from "lucide-react";
import { useEffect } from "react";

export function WatchStatusSelect() {
    const { type, movie, tv, anime, user_library } = usePage<PageProps>().props;
    const content = type === "movie" ? movie : type === "tv" ? tv : anime;
    if (!content) return null;

    const statusOptions = Object.values(WatchStatus).map((status) => ({
        value: status,
        label: status,
        disabled: status === user_library?.status,
    }));

    const { data, patch, setData, processing } = useForm({
        status: (user_library?.status as WatchStatus) ?? null,
    });

    useEffect(() => {
        setData("status", (user_library?.status as WatchStatus) ?? null);
    }, [user_library]);

    useEffect(() => {
        if (data.status && data.status !== user_library?.status) {
            patch(route("movie.library.update-status", content.id), {
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
                                res.props.flash.message || "An error occurred",
                            autoClose: 3000,
                        });
                    }
                },
            });
        }
    }, [data.status]);

    return (
        <Select
            placeholder="Choose Status"
            data={statusOptions}
            value={data.status}
            onChange={(val) => setData("status", val as WatchStatus)}
            clearable={false}
            disabled={processing}
        />
    );
}
