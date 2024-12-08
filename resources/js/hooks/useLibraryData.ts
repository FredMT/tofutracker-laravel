import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { LibraryEntry } from "@/types";

interface LibraryState {
    data: LibraryEntry[];
    next_page: number | null;
    total: number;
}

export function useLibraryData(initialLibrary: LibraryState) {
    const [library, setLibrary] = useState(initialLibrary);
    const [isLoading, setIsLoading] = useState(false);
    const loadingRef = useRef(false);
    const loadedPages = useRef(new Set([1]));

    const loadMore = async () => {
        if (loadingRef.current || !library.next_page || isLoading) return;

        loadingRef.current = true;
        setIsLoading(true);

        try {
            if (loadedPages.current.has(library.next_page)) {
                loadingRef.current = false;
                setIsLoading(false);
                return;
            }

            const response = await axios.get("/dashboard", {
                params: { page: library.next_page },
            });

            loadedPages.current.add(library.next_page);

            setLibrary((prev) => ({
                ...prev,
                data: [...prev.data, ...response.data.data],
                next_page: response.data.next_page,
            }));
        } catch (error) {
            console.error("Failed to load more:", error);
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
    };

    return {
        library,
        isLoading,
        loadMore,
    };
}
