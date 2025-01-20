import {Button, Drawer, Group, Stack} from "@mantine/core";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import React, {useState} from "react";
import {PencilIcon} from "lucide-react";
import {BannerUpload} from "@/Components/List/BannerActions/components/BannerUpload";
import {BannerSearchModal} from "@/Components/List/BannerActions/components/BannerSearch/BannerSearchModal";
import {RemoveBannerModal} from "@/Components/List/BannerActions/components/RemoveBannerModal";

interface BannerEditActionsProps {
    listId: number;
    onImageSelect: (file: File) => void;
    onImageUrlSelect?: (url: string) => void;
}

export function BannerEditActions({
    listId,
    onImageSelect,
    onImageUrlSelect,
}: BannerEditActionsProps) {
    const isMobile = useMediaQuery("max-width: 768px");
    const [isEditing, setIsEditing] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    const handleImageSelect = (file: File) => {
        onImageSelect(file);
        setIsEditing(false);
    };

    const handleImageUrlSelect = (url: string) => {
        onImageUrlSelect?.(url);
        setIsEditing(false);
    };

    const renderActions = () => (
        <Stack gap="sm">
            <Button onClick={() => setIsEditing(false)}>Cancel Edit</Button>
            <Button color="red" onClick={open}>
                Remove Banner
            </Button>
            <BannerUpload onImageSelect={handleImageSelect} />
            <BannerSearchModal
                listId={listId}
                onImageSelect={handleImageUrlSelect}
            />
        </Stack>
    );

    if (!isEditing) {
        return (
            <Button
                leftSection={<PencilIcon size={16} />}
                onClick={() => setIsEditing(true)}
            >
                Edit banner
            </Button>
        );
    }

    if (isMobile) {
        return (
            <>
                <RemoveBannerModal
                    listId={listId}
                    opened={opened}
                    onClose={close}
                    onSuccess={() => setIsEditing(false)}
                />
                <Drawer
                    opened={isEditing}
                    onClose={() => setIsEditing(false)}
                    title="Edit Banner"
                    position="bottom"
                    size="100%"
                >
                    {renderActions()}
                </Drawer>
                <Button
                    leftSection={<PencilIcon size={16} />}
                    onClick={() => setIsEditing(true)}
                >
                    Edit banner
                </Button>
            </>
        );
    }

    return (
        <>
            <RemoveBannerModal
                listId={listId}
                opened={opened}
                onClose={close}
                onSuccess={() => setIsEditing(false)}
            />
            <Group>{renderActions()}</Group>
        </>
    );
}
