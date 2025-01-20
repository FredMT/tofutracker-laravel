import { Button, Menu, Group, Stack } from "@mantine/core";
import {
    ListOrdered,
    PencilIcon,
    Plus,
    Settings2,
    Trash2,
    X,
    Image as ImageIcon,
} from "lucide-react";
import { useListStore } from "@/stores/listStore";
import { useAddItemsStore } from "@/stores/addItemsStore";
import { AddItemsModal } from "./AddItems/AddItemsModal";
import { useDisclosure } from "@mantine/hooks";
import { ListDelete } from "./ListDelete";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useState } from "react";
import { BannerUpload } from "./BannerActions/components/BannerUpload";
import { BannerSearchModal } from "./BannerActions/components/BannerSearch/BannerSearchModal";
import { RemoveBannerModal } from "./BannerActions/components/RemoveBannerModal";
import { SaveBannerButton } from "./BannerActions/components/SaveBannerButton";

interface ListEditMenuProps {
    listId: number;
    onOpenEditDetails: () => void;
    onImageSelect?: (file: File) => void;
    onImageUrlSelect?: (url: string) => void;
    hasBanner?: boolean;
    selectedFile?: File | null;
    onCancel?: () => void;
    isEmpty: boolean;
}

export function ListEditMenu({
    listId,
    onOpenEditDetails,
    onImageSelect,
    onImageUrlSelect,
    selectedFile,
    onCancel,
    isEmpty,
}: ListEditMenuProps) {
    const { auth } = usePage<PageProps>().props;
    const { setIsEditing, setIsRemoving } = useListStore();
    const { setIsOpen } = useAddItemsStore();
    const [opened, { open, close }] = useDisclosure(false);
    const [isEditingBanner, setIsEditingBanner] = useState(false);
    const [
        removeBannerOpened,
        { open: openRemoveBanner, close: closeRemoveBanner },
    ] = useDisclosure(false);

    if (!auth.user) return null;

    const handleImageSelect = (file: File) => {
        onImageSelect?.(file);
        setIsEditingBanner(false);
    };

    const handleImageUrlSelect = (url: string) => {
        onImageUrlSelect?.(url);
        setIsEditingBanner(false);
    };

    const handleSaveSuccess = () => {
        onCancel?.();
        setIsEditingBanner(false);
    };

    if (selectedFile) {
        return (
            <Group>
                <Button color="red" onClick={onCancel}>
                    Cancel
                </Button>
                <SaveBannerButton
                    listId={listId}
                    file={selectedFile}
                    onSuccess={handleSaveSuccess}
                />
            </Group>
        );
    }

    if (isEditingBanner) {
        return (
            <>
                <RemoveBannerModal
                    listId={listId}
                    opened={removeBannerOpened}
                    onClose={closeRemoveBanner}
                    onSuccess={() => setIsEditingBanner(false)}
                />
                <Group>
                    <Stack gap="sm">
                        <Button onClick={() => setIsEditingBanner(false)}>
                            Cancel Edit
                        </Button>
                        <Button color="red" onClick={openRemoveBanner}>
                            Remove Banner
                        </Button>
                        <BannerUpload onImageSelect={handleImageSelect} />
                        <BannerSearchModal
                            listId={listId}
                            onImageSelect={handleImageUrlSelect}
                        />
                    </Stack>
                </Group>
            </>
        );
    }

    return (
        <>
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Button leftSection={<PencilIcon size={16} />}>
                        Edit List
                    </Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<Settings2 size={14} />}
                        onClick={onOpenEditDetails}
                    >
                        Edit Details
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<ImageIcon size={14} />}
                        onClick={() => setIsEditingBanner(true)}
                    >
                        Edit Banner
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<Plus size={14} />}
                        onClick={() => setIsOpen(true)}
                    >
                        Add Items
                    </Menu.Item>
                    {!isEmpty && (
                        <Menu.Item
                            leftSection={<ListOrdered size={14} />}
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Order
                        </Menu.Item>
                    )}
                    {!isEmpty && (
                        <Menu.Item
                            leftSection={<Trash2 size={14} />}
                            onClick={() => setIsRemoving(true)}
                            color="red"
                        >
                            Remove Items
                        </Menu.Item>
                    )}
                    <Menu.Divider />
                    <Menu.Item
                        leftSection={<X size={14} />}
                        onClick={open}
                        color="red"
                    >
                        Delete List
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            <AddItemsModal listId={listId} />
            <ListDelete
                listId={listId}
                username={auth.user.username}
                opened={opened}
                onClose={close}
            />
        </>
    );
}
