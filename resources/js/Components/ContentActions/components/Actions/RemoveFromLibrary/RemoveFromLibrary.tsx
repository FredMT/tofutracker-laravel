import React from "react";
import { usePage } from "@inertiajs/react";
import {
    ROUTE_NAMES,
    CONTENT_NAMES,
    BUTTON_TEXTS,
    MODAL_TITLES,
    MODAL_CONTENTS,
} from "./constants/libraryConstants";
import {
    determineContentType,
    buildFormData,
} from "../shared/utils/contentTypeUtils";
import { LibraryPageProps } from "@/Components/ContentActions/components/Actions/shared/types/libraryTypes";
import { RemoveFromLibraryButton } from "@/Components/ContentActions/components/Actions/RemoveFromLibrary/components/RemoveFromLibraryButton";
import { useRemoveFromLibrary } from "@/Components/ContentActions/components/Actions/RemoveFromLibrary/hooks/useRemoveFromLibrary";

/**
 * Unified component for removing content from library
 * Handles different content types (movie, tv, anime, etc.)
 */
export default function RemoveFromLibrary() {
    const { type, data } = usePage<LibraryPageProps>().props;

    if (!data) return null;

    // Determine content type
    const contentType = determineContentType(type);

    // Build form data based on content type
    const formData = buildFormData(contentType, data);

    // Get route name, content name, button text, modal title, and modal content
    const routeName = ROUTE_NAMES[contentType];
    const contentName = CONTENT_NAMES[contentType];
    const buttonText = BUTTON_TEXTS[contentType];
    const modalTitle = MODAL_TITLES[contentType];
    const modalContent = MODAL_CONTENTS[contentType];

    // Use the hook to handle removing from library
    const { handleRemove, processing } = useRemoveFromLibrary({
        routeName,
        formData,
        itemName: contentName,
    });

    return (
        <RemoveFromLibraryButton
            handleRemove={handleRemove}
            processing={processing}
            buttonText={buttonText}
            modalTitle={modalTitle}
            modalContent={modalContent}
        />
    );
}
