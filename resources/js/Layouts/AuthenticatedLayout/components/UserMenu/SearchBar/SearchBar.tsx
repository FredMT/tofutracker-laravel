import { useEffect, useRef, useState } from "react";
import {
    Combobox,
    Group,
    Loader,
    Text,
    TextInput,
    useCombobox,
} from "@mantine/core";
import { ArrowRight, Rocket, Search, SearchCheck } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { useDebouncedValue } from "@mantine/hooks";
import styles from "./SearchBar.module.css";
import SearchResultItem from "./SearchResultItem";
import { SearchResponse, SearchResult } from "@/types/quickSearch";

interface SearchBarProps {
    onOpenChange?: (opened: boolean) => void;
}

export default function SearchBar({ onOpenChange }: SearchBarProps) {
    const { component } = usePage();

    if (component === "Search") return null;

    const combobox = useCombobox({
        onDropdownClose: () => {
            combobox.resetSelectedOption();
            onOpenChange?.(false);
        },
        onDropdownOpen: () => onOpenChange?.(true),
    });

    const [value, setValue] = useState("");
    const [debouncedValue] = useDebouncedValue(value, 200);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const abortController = useRef<AbortController>();

    const fetchResults = async (query: string) => {
        if (!query) {
            setResults([]);
            return;
        }

        abortController.current?.abort();
        abortController.current = new AbortController();
        setLoading(true);

        try {
            const response = await fetch(
                route("quicksearch", {
                    q: query,
                    max_results: 4,
                }),
                {
                    signal: abortController.current.signal,
                }
            );
            const data: SearchResponse = await response.json();
            const resultsArray = Object.values(data.results || {});
            setResults(resultsArray);
            setLoading(false);
            abortController.current = undefined;
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            console.error("Search error:", error);
            setResults([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults(debouncedValue);
    }, [debouncedValue]);

    const options = results.map((result) => (
        <Combobox.Option value={result.title} key={result.id}>
            <Link
                href={route(`${result.media_type}.show`, { id: result.id })}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <SearchResultItem {...result} />
            </Link>
        </Combobox.Option>
    ));

    return (
        <Combobox
            onOptionSubmit={(optionValue) => {
                if (optionValue !== "view_all") {
                    setValue(optionValue);
                }
                combobox.closeDropdown();
            }}
            withinPortal={false}
            store={combobox}
        >
            <Combobox.Target>
                <TextInput
                    placeholder="Search movies, tv shows and anime..."
                    leftSection={
                        <Search className={styles.searchIcon} size={16} />
                    }
                    rightSection={loading && <Loader size={18} />}
                    value={value}
                    onChange={(event) => {
                        setValue(event.currentTarget.value);
                        combobox.resetSelectedOption();
                        combobox.openDropdown();
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => {
                        combobox.openDropdown();
                        if (value && results.length === 0) {
                            fetchResults(value);
                        }
                    }}
                    size="sm"
                    w={400}
                    classNames={{
                        input: styles.searchInput,
                    }}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {options}
                    {!loading && results.length === 0 && !value && (
                        <>
                            <Combobox.Option value="search_prompt" disabled>
                                <Group justify="space-between" p="xs">
                                    <Text size="sm" c="dimmed">
                                        Start typing to search...
                                    </Text>
                                    <SearchCheck
                                        size={16}
                                        className={styles.searchIcon}
                                    />
                                </Group>
                            </Combobox.Option>
                            <Combobox.Option value="view_all">
                                <Link
                                    href={route("search")}
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                    }}
                                >
                                    <Group justify="space-between" p="xs">
                                        <Text size="sm">
                                            To the search page
                                        </Text>
                                        <Rocket size={16} />
                                    </Group>
                                </Link>
                            </Combobox.Option>
                        </>
                    )}
                    {!loading && results.length === 0 && value && (
                        <Combobox.Empty>No results found</Combobox.Empty>
                    )}
                    {value && (
                        <Combobox.Option value="view_all">
                            <Link
                                href={route("search", { q: value })}
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                <Group justify="space-between" p="xs">
                                    <Text size="sm">View all results</Text>
                                    <ArrowRight size={16} />
                                </Group>
                            </Link>
                        </Combobox.Option>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
