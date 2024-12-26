import { useFilterStore } from "@/stores/filterStore";
import { UserData } from "@/types/userData";
import { router, usePage } from "@inertiajs/react";
import { TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef } from "react";

interface FilterSearchInputProps {
    contentType: "movies" | "tv";
}

export function FilterSearchInput({ contentType }: FilterSearchInputProps) {
    const { userData } = usePage<{ userData: UserData }>().props;
    const { title, setTitle } = useFilterStore();
    const [debouncedSearch] = useDebouncedValue(title ?? "", 300);
    const isFirstRender = useRef(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const titleParam = params.get("title");
        if (titleParam && !title) {
            setTitle(titleParam);
        }
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const currentParams = new URLSearchParams(window.location.search);
        if (debouncedSearch === currentParams.get("title")) return;

        router.get(
            `/user/${userData.username}/${contentType}`,
            debouncedSearch ? { title: debouncedSearch } : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, userData.username, contentType]);

    return (
        <TextInput
            label={`Search your ${contentType}`}
            placeholder={`Search your ${contentType}: ${
                contentType === "movies" ? "Shawshank" : "The 100"
            }`}
            value={title ?? ""}
            onChange={(event) => setTitle(event.currentTarget.value || null)}
            w="100%"
        />
    );
}

export default FilterSearchInput;
