import { Select } from "@mantine/core";
import { useSortAndFiltersStore } from "@/stores/sortAndFiltersStore";
import { ListItemGenre } from "@/types/listPage";
import { useEffect } from "react";

interface GenresSelectProps {
    listGenres: ListItemGenre[];
}

function GenresSelect({ listGenres }: GenresSelectProps) {
    const { selectedGenre, setSelectedGenre, updateUrlAndNavigate } =
        useSortAndFiltersStore();

    const genreOptions = [
        { label: "Any Genre", value: "any" },
        ...listGenres.map((genre) => ({
            label: genre.name,
            value: genre.id.toString(),
        })),
    ];

    useEffect(() => {
        if (!selectedGenre) {
            setSelectedGenre("any");
        }
    }, [selectedGenre, setSelectedGenre]);

    const handleChange = (value: string | null) => {
        setSelectedGenre(value === "any" ? null : value);
        updateUrlAndNavigate();
    };

    return (
        <Select
            label="Genre"
            value={selectedGenre || "any"}
            onChange={handleChange}
            data={genreOptions}
            placeholder="Genre"
            clearable={false}
            searchable
            w={175}
            maxDropdownHeight={250}
            comboboxProps={{ width: 200, position: "bottom-start" }}
        />
    );
}

export default GenresSelect;
