import { Drawer, Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { EditListForm } from "./EditListForm";
import { ListPage } from "@/types/listPage";

interface EditListModalProps {
    list: ListPage;
    opened: boolean;
    onClose: () => void;
}

export function EditListModal({ list, opened, onClose }: EditListModalProps) {
    const isMobile = useMediaQuery("(max-width: 48em)");

    const content = <EditListForm list={list} onClose={onClose} />;

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
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit List Details"
            centered
        >
            {content}
        </Modal>
    );
}
