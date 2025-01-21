import { Drawer, Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ListEditForm } from "./ListEditForm";
import { ListPage } from "@/types/listPage";

interface EditListModalProps {
    list: ListPage;
    opened: boolean;
    onClose: () => void;
}

export function ListEditModal({ list, opened, onClose }: EditListModalProps) {
    const isMobile = useMediaQuery("(max-width: 48em)");

    const content = <ListEditForm list={list} onClose={onClose} />;

    if (isMobile) {
        return (
            <Drawer
                opened={opened}
                onClose={onClose}
                title="Edit List Details"
                position="bottom"
                size="auto"
            >
                {content}
            </Drawer>
        );
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Edit List Details">
            {content}
        </Modal>
    );
}
