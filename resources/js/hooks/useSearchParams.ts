import { useMounted } from "@mantine/hooks";
import { useEffect, useState } from "react";

export function useSearchParams() {
    const mounted = useMounted();
    const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
        null
    );

    useEffect(() => {
        if (mounted) {
            const url = new URL(window.location.href);
            setSearchParams(url.searchParams);
        }
    }, [mounted]);

    const getParam = (name: string): string | null => {
        if (!searchParams) return null;
        return searchParams.get(name);
    };

    const hasParam = (name: string): boolean => {
        if (!searchParams) return false;
        return searchParams.has(name);
    };

    const getAllParams = (): Record<string, string> => {
        const params: Record<string, string> = {};
        if (!searchParams) return params;

        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    };

    return {
        getParam,
        hasParam,
        getAllParams,
    };
}
