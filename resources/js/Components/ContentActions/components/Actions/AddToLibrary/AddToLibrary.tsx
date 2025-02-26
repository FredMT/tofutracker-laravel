import React from "react";
import { usePage } from "@inertiajs/react";
import { useAddToLibrary } from "@/Components/ContentActions/components/Actions/AddToLibrary/hooks/useAddToLibrary";
import { AddToLibraryButton } from "@/Components/ContentActions/components/Actions/AddToLibrary/components/AddToLibraryButton";
import {
    LibraryPageProps,
    ContentType,
} from "@/Components/ContentActions/components/Actions/AddToLibrary/types/libraryTypes";
import {
    ROUTE_NAMES,
    CONTENT_NAMES,
    BUTTON_TEXTS,
} from "@/Components/ContentActions/components/Actions/AddToLibrary/constants/libraryConstants";
import {
    determineContentType,
    buildFormData,
} from "@/Components/ContentActions/components/Actions/AddToLibrary/utils/contentTypeUtils";

/**
 * Unified component for adding any content type to library
 */
export default function AddToLibrary() {
    const { type, data } = usePage<LibraryPageProps>().props;

    if (!data) return null;

    // Determine content type
    const contentType = determineContentType(type);

    // If we can't determine the type, don't render anything
    if (!contentType) return null;

    // Build form data based on content type
    const formData = buildFormData(contentType, data);

    // Get item name and button text
    const itemName = CONTENT_NAMES[contentType];
    const buttonText = BUTTON_TEXTS[contentType] || "Add to Library";

    // Use the hook to handle adding to library
    const { handleAdd, processing } = useAddToLibrary({
        routeName: ROUTE_NAMES[contentType],
        formData,
        itemName,
    });

    return (
        <AddToLibraryButton
            onClick={handleAdd}
            processing={processing}
            buttonText={buttonText}
        />
    );
}
