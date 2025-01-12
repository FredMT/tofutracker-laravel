import { usePage, router } from "@inertiajs/react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { UserLists } from "@/Components/ContentActions/components/Actions/AddToList/types";
import MobileAddToList from "@/Components/ContentActions/components/Actions/AddToList/components/MobileAddToList";
import DesktopAddToList from "@/Components/ContentActions/components/Actions/AddToList/components/DesktopAddToList";

export default function AddToList() {
    const { user_lists: lists, auth } = usePage<{
        user_lists: UserLists;
        auth: { user: { username: string } };
    }>().props;

    const isMobile = useMediaQuery("(max-width: 640px)");
    const [opened, { open, close }] = useDisclosure(false);
    const [createOpened, { open: openCreate, close: closeCreate }] =
        useDisclosure(false);
    const [search, setSearch] = useState("");

    const filteredLists = lists.filter((list) =>
        list.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddToList = (listId: number) => {
        // TODO: Implement add to list functionality
        console.log("Add to list:", listId);
    };

    const handleGoToList = (listId: number) => {
        router.visit(`/lists/${listId}`);
    };

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
        handleAddToList,
        handleGoToList,
    };

    if (isMobile) {
        return <MobileAddToList {...sharedProps} />;
    }

    return <DesktopAddToList {...sharedProps} />;
}
