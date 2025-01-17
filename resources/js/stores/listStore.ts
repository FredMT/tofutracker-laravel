import { create } from "zustand";
import { ListItem } from "@/types/listPage";

interface ListStore {
    items: ListItem[];
    originalItems: ListItem[];
    isEditing: boolean;
    isRemoving: boolean;
    hasChanges: boolean;
    removedItems: ListItem[];
    setItems: (items: ListItem[]) => void;
    setOriginalItems: (items: ListItem[]) => void;
    setIsEditing: (isEditing: boolean) => void;
    setIsRemoving: (isRemoving: boolean) => void;
    setHasChanges: (hasChanges: boolean) => void;
    resetToOriginal: () => void;
    handleOrderChange: (newItems: ListItem[]) => void;
    removeItem: (itemId: number) => void;
    resetRemovedItems: () => void;
}

export const useListStore = create<ListStore>((set, get) => ({
    items: [],
    originalItems: [],
    isEditing: false,
    isRemoving: false,
    hasChanges: false,
    removedItems: [],
    setItems: (items) => set({ items }),
    setOriginalItems: (items) => set({ originalItems: items }),
    setIsEditing: (isEditing) => set({ isEditing }),
    setIsRemoving: (isRemoving) => {
        if (!isRemoving) {
            get().resetRemovedItems();
        }
        set({ isRemoving });
    },
    setHasChanges: (hasChanges) => set({ hasChanges }),
    resetToOriginal: () => {
        const { originalItems } = get();
        set({ items: originalItems, hasChanges: false, removedItems: [] });
    },
    handleOrderChange: (newItems) => {
        const { originalItems } = get();
        const hasOrderChanged = newItems.some((item) => {
            const originalItem = originalItems.find((i) => i.id === item.id);
            return originalItem && originalItem.sort_order !== item.sort_order;
        });

        set({ items: newItems, hasChanges: hasOrderChanged });
    },
    removeItem: (itemId) => {
        const { items, removedItems } = get();
        const itemToRemove = items.find((item) => item.id === itemId);
        if (itemToRemove) {
            set({
                items: items.filter((item) => item.id !== itemId),
                removedItems: [...removedItems, itemToRemove],
                hasChanges: true,
            });
        }
    },
    resetRemovedItems: () => {
        const { originalItems } = get();
        set({ items: originalItems, removedItems: [], hasChanges: false });
    },
}));
