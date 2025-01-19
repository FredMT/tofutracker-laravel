import { TextInput } from "@mantine/core";
import { useSortAndFiltersStore } from "@/stores/sortAndFiltersStore";
import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Search } from "lucide-react";

function ListSearchFilter() {
    const { search, setSearch, updateUrlAndNavigate } =
        useSortAndFiltersStore();
    const [value, setValue] = useState(search || "");
    const [debouncedValue] = useDebouncedValue(value, 200);
    const abortController = useRef<AbortController>();
    const initialRender = useRef(true);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        abortController.current?.abort();
        abortController.current = new AbortController();

        setSearch(debouncedValue || null);
        updateUrlAndNavigate();

        return () => {
            abortController.current?.abort();
        };
    }, [debouncedValue]);

    return (
        <TextInput
            label="Search"
            placeholder="Search in this list"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            w="100%"
            miw={300}
            maw={350}
            leftSection={<Search size={16} />}
        />
    );
}

export default ListSearchFilter;
