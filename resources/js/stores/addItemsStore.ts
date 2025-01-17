import { create } from "zustand";
import { SearchResult } from "@/types/quickSearch";
import { router } from "@inertiajs/react";

interface AddItemsStore {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    query: string;
    setQuery: (query: string) => void;
    addItemToList: (
        listId: number,
        itemType: string,
        itemId: number,
        animeType?: string,
        onComplete?: () => void
    ) => void;
}

export const useAddItemsStore = create<AddItemsStore>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    query: "",
    setQuery: (query) => set({ query }),
    addItemToList: (listId, itemType, itemId, animeType, onComplete) => {
        router.post(
            route("user.lists.items.store"),
            {
                list_id: listId,
                item_type: itemType === "anime" ? animeType : itemType,
                item_id: itemId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    onComplete?.();
                },
                onError: (errors) => {
                    console.error("Failed to add item to list:", errors);
                    onComplete?.();
                },
            }
        );
    },
}));
