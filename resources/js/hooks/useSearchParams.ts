import { usePage } from "@inertiajs/react";

export function useSearchParams() {
    const page = usePage();
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const getParam = (name: string): string | null => {
        return searchParams.get(name);
    };

    const hasParam = (name: string): boolean => {
        return searchParams.has(name);
    };

    const getAllParams = (): Record<string, string> => {
        const params: Record<string, string> = {};
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
