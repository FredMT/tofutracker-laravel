import {ActionIcon} from "@mantine/core";
import {Plus} from "lucide-react";
import React from "react";
import {UserList} from "../../types";
import {AnimeContentDataType, ContentType, FlashMessage, RegularContentDataType,} from "@/types";
import {useForm, usePage} from "@inertiajs/react";
import {notifications} from "@mantine/notifications";

type AddToListProps = {
    list: UserList;
};

function AddToList({ list }: AddToListProps) {
    const { type, data } = usePage<{
        type: ContentType;
        data: RegularContentDataType | AnimeContentDataType;
        flash: FlashMessage;
    }>().props;

    const itemId = ["animemovie", "animetv"].includes(type)
        ? data.map_id
        : data.id;

    const { processing, post } = useForm({
        list_id: list.id,
        item_id: itemId,
        item_type: type,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("user.lists.items.store"), {
            preserveScroll: true,
            onSuccess: (res: any) => {
                if (res.props.flash && res.props.flash.message) {
                    if (res.props.flash.success) {
                        notifications.show({
                            message: res.props.flash.message,
                            color: "green",
                        });
                    } else {
                        notifications.show({
                            message: res.props.flash.message,
                            color: "red",
                        });
                    }
                }
            },
            onError: () => {
                notifications.show({
                    message: "An error occurred while adding item to list",
                    color: "red",
                });
            },
        });
    };

    return (
        <form onSubmit={submit}>
            <ActionIcon
                variant="subtle"
                color="violet"
                type="submit"
                disabled={processing}
            >
                <Plus size={16} />
            </ActionIcon>
        </form>
    );
}

export default AddToList;
