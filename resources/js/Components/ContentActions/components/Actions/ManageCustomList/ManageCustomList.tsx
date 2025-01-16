import {Link, usePage} from "@inertiajs/react";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {useState} from "react";
import {UserLists} from "@/Components/ContentActions/components/Actions/ManageCustomList/types";
import MobileAddToList
    from "@/Components/ContentActions/components/Actions/ManageCustomList/components/MobileAddToList";
import DesktopAddToList
    from "@/Components/ContentActions/components/Actions/ManageCustomList/components/DesktopAddToList";
import {Button} from "@mantine/core";
import {Auth} from "@/types";

export default function ManageCustomList() {
    const { user_lists: lists, auth } = usePage<{
        user_lists: UserLists;
        auth: Auth;
    }>().props;

    if (!auth.user)
        return (
            <Button component={Link} href={route("login")} variant="outline">
                Add to List
            </Button>
        );

    const isMobile = useMediaQuery("(max-width: 640px)");
    const [opened, { open, close }] = useDisclosure(false);
    const [createOpened, { open: openCreate, close: closeCreate }] =
        useDisclosure(false);
    const [search, setSearch] = useState("");

    const filteredLists = lists.filter((list) =>
        list.title.toLowerCase().includes(search.toLowerCase())
    );

    const sharedProps = {
        opened,
        createOpened,
        close,
        closeCreate,
        open,
        openCreate,
        search,
        setSearch,
        filteredLists,
    };

    if (isMobile) {
        return <MobileAddToList {...sharedProps} />;
    }

    return <DesktopAddToList {...sharedProps} />;
}
