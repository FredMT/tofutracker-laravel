import { Button, Group } from "@mantine/core";
import classes from "./BannerActions.module.css";
import { SaveBannerButton } from "@/Components/List/BannerActions/components/SaveBannerButton";
import { BannerUpload } from "@/Components/List/BannerActions/components/BannerUpload";
import { BannerSearchModal } from "@/Components/List/BannerActions/components/BannerSearch/BannerSearchModal";
import { BannerEditActions } from "./components/BannerEditActions";

interface BannerActionsProps {
    listId: number;
    onImageSelect: (file: File) => void;
    onImageUrlSelect?: (url: string) => void;
    hasSelectedImage?: boolean;
    selectedFile?: File | null;
    onCancel?: () => void;
    hasBanner?: boolean;
}

export function BannerActions({
    listId,
    onImageSelect,
    onImageUrlSelect,
    hasSelectedImage,
    selectedFile,
    onCancel,
    hasBanner,
}: BannerActionsProps) {
    return (
        <div className={classes.actionsContainer}>
            <Group>
                {hasSelectedImage && selectedFile ? (
                    <>
                        <Button color="red" onClick={onCancel}>
                            Cancel
                        </Button>
                        <SaveBannerButton
                            listId={listId}
                            file={selectedFile}
                            onSuccess={onCancel}
                        />
                    </>
                ) : hasBanner ? (
                    <BannerEditActions
                        listId={listId}
                        onImageSelect={onImageSelect}
                        onImageUrlSelect={onImageUrlSelect}
                    />
                ) : (
                    <>
                        <BannerUpload onImageSelect={onImageSelect} />
                        <BannerSearchModal
                            listId={listId}
                            onImageSelect={onImageUrlSelect}
                        />
                    </>
                )}
            </Group>
        </div>
    );
}
