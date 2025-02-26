import React from "react";
import { useForm } from "@inertiajs/react";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon } from "lucide-react";
import { AddToLibraryParams } from "../types/libraryTypes";

/**
 * Hook for handling adding items to library
 */
export function useAddToLibrary({
    routeName,
    formData,
    itemName = "item",
}: AddToLibraryParams) {
    const { post, processing } = useForm(formData);

    const handleAdd = () => {
        post(route(routeName), {
            preserveScroll: true,
            onSuccess: (res: any) => {
                if (res.props.flash?.success) {
                    notifications.show({
                        color: "teal",
                        title: "Success",
                        message: res.props.flash.message,
                        icon: React.createElement(Check, { size: 18 }),
                        autoClose: 3000,
                    });
                }
                if (!res.props.flash?.success) {
                    notifications.show({
                        color: "red",
                        title: "Error",
                        message:
                            res.props.flash?.message ||
                            `Failed to add ${itemName} to library`,
                        icon: React.createElement(CircleAlertIcon, {
                            size: 18,
                        }),
                        autoClose: 3000,
                    });
                }
            },
            onError: () => {
                notifications.show({
                    color: "red",
                    title: "Error",
                    message: `An error occurred while adding ${itemName} to library`,
                    icon: React.createElement(CircleAlertIcon, { size: 18 }),
                    autoClose: 3000,
                });
            },
        });
    };

    return {
        handleAdd,
        processing,
    };
}
