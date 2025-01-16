import ResponsiveContainer from "@/Components/ResponsiveContainer";
import SearchResultsList from "@/Components/Search/SearchResultsList";
import TabItem from "@/Components/Search/TabItem";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import {SearchResults} from "@/types/search";
import {Head, router} from "@inertiajs/react";
import {Space, Tabs, TextInput} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {SearchIcon} from "lucide-react";
import React from "react";

type TabValue = "movies" | "tv" | "anime";

interface PageProps {
    search_results: SearchResults | null;
    query?: string;
    flash?: {
        success?: boolean;
        message?: string;
    };
}

function Search({ search_results, query = "" }: PageProps) {
    const [search, setSearch] = React.useState(query);
    const [debounced] = useDebouncedValue(search, 300);
    const [activeTab, setActiveTab] = React.useState<TabValue>("movies");

    React.useEffect(() => {
        if (debounced !== query) {
            router.get(
                "/search",
                { q: debounced },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }
    }, [debounced]);

    React.useEffect(() => {
        if (!search_results) return;

        const hasResults = {
            movies: search_results.movies.length > 0,
            tv: search_results.tv.length > 0,
            anime: search_results.anime.length > 0,
        };

        // If current tab has results, stay on it
        if (hasResults[activeTab]) {
            return;
        }

        // If current tab has no results, find a tab that does
        const tabsWithResults = Object.entries(hasResults)
            .filter(([_, hasResult]) => hasResult)
            .map(([tab]) => tab as TabValue);

        if (tabsWithResults.length === 1) {
            setActiveTab(tabsWithResults[0]);
        } else if (tabsWithResults.length > 1) {
            // If multiple tabs have results, prefer in order: movies, tv, anime
            const preferredOrder: TabValue[] = ["anime", "tv", "movies"];
            const firstAvailableTab = preferredOrder.find((tab) =>
                tabsWithResults.includes(tab)
            );
            if (firstAvailableTab) {
                setActiveTab(firstAvailableTab);
            }
        }
    }, [search_results]);

    return (
        <>
            <Head title={query ? `Search results for "${query}"` : "Search"} />
            <Space h={64} />
            <ResponsiveContainer>
                <div className="py-5">
                    <TextInput
                        leftSectionPointerEvents="none"
                        leftSection={<SearchIcon />}
                        label="Search"
                        size="xl"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.currentTarget.value)
                        }
                    />
                    <Space h={24} />
                    <Tabs
                        defaultValue="movies"
                        value={activeTab}
                        onChange={(value) => setActiveTab(value as TabValue)}
                    >
                        <Tabs.List grow>
                            <TabItem
                                label="Movies"
                                value="movies"
                                count={search_results?.movies.length}
                            />
                            <TabItem
                                label="TV Shows"
                                value="tv"
                                count={search_results?.tv.length}
                            />
                            <TabItem
                                label="Anime"
                                value="anime"
                                count={search_results?.anime.length}
                            />
                        </Tabs.List>

                        <Space h={24} />
                        <Tabs.Panel value="movies">
                            {search_results?.movies && (
                                <SearchResultsList
                                    items={search_results.movies}
                                    type="movies"
                                />
                            )}
                        </Tabs.Panel>

                        <Tabs.Panel value="tv">
                            {search_results?.tv && (
                                <SearchResultsList
                                    items={search_results.tv}
                                    type="tv"
                                />
                            )}
                        </Tabs.Panel>

                        <Tabs.Panel value="anime">
                            {search_results?.anime && (
                                <SearchResultsList
                                    items={search_results.anime}
                                    type="anime"
                                />
                            )}
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </ResponsiveContainer>
        </>
    );
}
Search.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Search;
