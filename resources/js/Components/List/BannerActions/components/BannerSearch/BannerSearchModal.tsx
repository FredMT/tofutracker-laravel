import { Button, Drawer, Modal, useModalsStack } from "@mantine/core";
import { useFetch, useMediaQuery } from "@mantine/hooks";
import { useForm } from "@inertiajs/react";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { BackdropData } from "@/Components/List/BannerActions/components/BannerSearch/types";
import { ItemsList } from "@/Components/List/BannerActions/components/BannerSearch/ItemsList";
import { BackdropGrid } from "@/Components/List/BannerActions/components/BannerSearch/BackdropGrid";

interface BannerSearchModalProps {
    listId: number;
    onImageSelect?: (imageUrl: string) => void;
}

export function BannerSearchModal({
    listId,
    onImageSelect,
}: BannerSearchModalProps) {
    const isMobile = useMediaQuery("(max-width: 48em)");
    const stack = useModalsStack(["items-list", "backdrops"]);
    const [selectedMovie, setSelectedMovie] = useState<BackdropData | null>(
        null
    );
    const [selectedBackdrop, setSelectedBackdrop] = useState<string | null>(
        null
    );

    const form = useForm({
        file_path: "",
    });

    const { data, loading, error, refetch } = useFetch<BackdropData[]>(
        route("list.backdrops", { list: listId }),
        { autoInvoke: false }
    );

    const handleMovieSelect = (movie: BackdropData) => {
        setSelectedMovie(movie);
        setSelectedBackdrop(null);
        stack.open("backdrops");
    };

    const handleBackdropSelect = (path: string) => {
        setSelectedBackdrop(path);
        form.setData("file_path", path);
    };

    const handleSubmit = () => {
        if (!selectedBackdrop) return;

        form.post(route("list.banner.tmdb.update", { list: listId }), {
            onSuccess: () => {
                onImageSelect?.(selectedBackdrop);
                stack.closeAll();
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleOpenSearch = () => {
        setSelectedMovie(null);
        setSelectedBackdrop(null);
        form.reset();
        refetch();
        stack.open("items-list");
    };

    const renderContent = (type: "items-list" | "backdrops") => {
        if (type === "items-list") {
            return (
                <ItemsList
                    loading={loading}
                    error={error}
                    data={data}
                    onItemSelect={handleMovieSelect}
                />
            );
        }

        return (
            <BackdropGrid
                selectedMovie={selectedMovie}
                selectedBackdrop={selectedBackdrop}
                onBackdropSelect={handleBackdropSelect}
                onSubmit={handleSubmit}
                isSubmitting={form.processing}
            />
        );
    };

    if (isMobile) {
        return (
            <>
                <Drawer
                    opened={stack.state["items-list"]}
                    onClose={() => stack.close("items-list")}
                    title="Select an item from your list"
                    position="bottom"
                    size="100%"
                >
                    {renderContent("items-list")}
                </Drawer>

                <Drawer
                    opened={stack.state["backdrops"]}
                    onClose={() => stack.close("backdrops")}
                    title={
                        selectedMovie?.title
                            ? `Select a backdrop from ${selectedMovie.title}`
                            : "Select a backdrop"
                    }
                    position="bottom"
                    size="100%"
                >
                    {renderContent("backdrops")}
                </Drawer>

                <Button
                    leftSection={<SearchIcon size={16} />}
                    onClick={handleOpenSearch}
                >
                    Search for banner
                </Button>
            </>
        );
    }

    return (
        <>
            <Modal.Stack>
                <Modal
                    {...stack.register("items-list")}
                    title="Select an item from your list"
                    size="lg"
                >
                    {renderContent("items-list")}
                </Modal>

                <Modal
                    {...stack.register("backdrops")}
                    title={
                        selectedMovie?.title
                            ? `Select a backdrop from ${selectedMovie.title}`
                            : "Select a backdrop"
                    }
                    size="xl"
                >
                    {renderContent("backdrops")}
                </Modal>
            </Modal.Stack>

            <Button
                leftSection={<SearchIcon size={16} />}
                onClick={handleOpenSearch}
            >
                Search for banner
            </Button>
        </>
    );
}
