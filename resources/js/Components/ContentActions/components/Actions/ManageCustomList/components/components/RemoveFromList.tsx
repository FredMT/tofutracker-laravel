import {AnimeContentDataType, ContentType, FlashMessage, RegularContentDataType,} from "@/types";
import {useForm, usePage} from "@inertiajs/react";
import {ActionIcon} from "@mantine/core";
import {Minus} from "lucide-react";
import {UserList} from "../../types";
import {notifications} from "@mantine/notifications";

type RemoveFromListProps = {
    list: UserList;
};

function RemoveFromList({ list }: RemoveFromListProps) {
    const { type, data } = usePage<{
        type: ContentType;
        data: RegularContentDataType | AnimeContentDataType;
        flash: FlashMessage;
    }>().props;

    const itemId = ["animemovie", "animetv"].includes(type)
        ? data.map_id
        : data.id;

    const { processing, delete: destroy } = useForm({
        list_id: list.id,
        item_id: itemId,
        item_type: type,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        destroy(route("user.lists.items.destroy"), {
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
                color="red"
                type="submit"
                disabled={processing}
            >
                <Minus size={16} />
            </ActionIcon>
        </form>
    );
}

export default RemoveFromList;
