import { create } from "zustand";
import { ListItem } from "@/types/listPage";

interface ListStore {
    items: ListItem[];
    originalItems: ListItem[];
    isEditing: boolean;
    hasChanges: boolean;
    setItems: (items: ListItem[]) => void;
    setOriginalItems: (items: ListItem[]) => void;
    setIsEditing: (isEditing: boolean) => void;
    setHasChanges: (hasChanges: boolean) => void;
    resetToOriginal: () => void;
    handleOrderChange: (newItems: ListItem[]) => void;
}

export const useListStore = create<ListStore>((set, get) => ({
    items: [],
    originalItems: [],
    isEditing: false,
    hasChanges: false,
    setItems: (items) => set({ items }),
    setOriginalItems: (items) => set({ originalItems: items }),
    setIsEditing: (isEditing) => set({ isEditing }),
    setHasChanges: (hasChanges) => set({ hasChanges }),
    resetToOriginal: () => {
        const { originalItems } = get();
        set({ items: originalItems, hasChanges: false });
    },
    handleOrderChange: (newItems) => {
        const { originalItems } = get();
        const hasOrderChanged = newItems.some((item) => {
            const originalItem = originalItems.find((i) => i.id === item.id);
            return originalItem && originalItem.sort_order !== item.sort_order;
        });

        set({ items: newItems, hasChanges: hasOrderChanged });
    },
}));
