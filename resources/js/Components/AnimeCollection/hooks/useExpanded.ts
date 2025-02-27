import { useState } from "react";

/**
 * Hook to manage expanded state for nested tables
 */
export function useExpanded() {
    const [expandedCollectionIds, setExpandedCollectionIds] = useState<
        number[]
    >([]);
    const [expandedChainIds, setExpandedChainIds] = useState<number[]>([]);

    return {
        expandedCollectionIds,
        setExpandedCollectionIds,
        expandedChainIds,
        setExpandedChainIds,
        isCollectionExpanded: (id: number) =>
            expandedCollectionIds.includes(id),
        isChainExpanded: (id: number) => expandedChainIds.includes(id),
    };
}
