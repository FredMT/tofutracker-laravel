import { useFilterStore } from "@/stores/filterStore";
import { PageProps } from "@/types/userMovies";
import { router, usePage } from "@inertiajs/react";
import { TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef } from "react";

export function FilterSearchInput() {
    const { userData } = usePage<PageProps>().props;
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
            `/user/${userData.username}/movies`,
            debouncedSearch ? { title: debouncedSearch } : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, userData.username]);

    return (
        <TextInput
            placeholder="Search your movies"
            value={title ?? ""}
            onChange={(event) => setTitle(event.currentTarget.value || null)}
        />
    );
}

export default FilterSearchInput;
