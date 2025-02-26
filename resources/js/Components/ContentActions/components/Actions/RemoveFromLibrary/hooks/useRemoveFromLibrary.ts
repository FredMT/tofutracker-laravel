import React from "react";
import { useForm } from "@inertiajs/react";
import { notifications } from "@mantine/notifications";
import { Check, CircleAlertIcon } from "lucide-react";

type RemoveFromLibraryParams = {
    routeName: string;
    formData: Record<string, any>;
    itemName?: string;
};

/**
 * Hook for handling removing items from library
 */
export function useRemoveFromLibrary({
    routeName,
    formData,
    itemName = "item",
}: RemoveFromLibraryParams) {
    const { delete: destroy, processing } = useForm(formData);

    const handleRemove = () => {
        destroy(route(routeName), {
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
                            `Failed to remove ${itemName} from library`,
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
                    message: `An error occurred while removing ${itemName} from library`,
                    icon: React.createElement(CircleAlertIcon, { size: 18 }),
                    autoClose: 3000,
                });
            },
        });
    };

    return {
        handleRemove,
        processing,
    };
}
