import {Button} from "@mantine/core";
import {useForm} from "@inertiajs/react";
import React from "react";

interface SaveBannerButtonProps {
    listId: number;
    file: File;
    onSuccess?: () => void;
}

export function SaveBannerButton({
    listId,
    file,
    onSuccess,
}: SaveBannerButtonProps) {
    const { post, processing } = useForm({
        banner: file,
    });

    const handleSave = () => {
        post(route("list.banner.update", { list: listId }), {
            forceFormData: true,
            onSuccess: () => {
                onSuccess?.();
            },
            preserveScroll: true,
        });
    };

    return (
        <Button onClick={handleSave} loading={processing} disabled={processing}>
            Save
        </Button>
    );
}
