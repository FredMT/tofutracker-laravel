import {useFilterStore} from "@/stores/filterStore";
import {PageProps} from "@/types/userMovies";
import {usePage} from "@inertiajs/react";
import {Checkbox, Combobox, Group, Input, Pill, PillsInput, useCombobox,} from "@mantine/core";

export function GenreFilter() {
    const { genres } = usePage<PageProps>().props;
    const { genres: selectedGenres, setGenres } = useFilterStore();

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
    });

    const handleValueSelect = (genreId: number) => {
        setGenres(
            selectedGenres.includes(genreId)
                ? selectedGenres.filter((id) => id !== genreId)
                : [...selectedGenres, genreId]
        );
    };

    const handleValueRemove = (genreId: number) => {
        setGenres(selectedGenres.filter((id) => id !== genreId));
    };

    const values = selectedGenres.map((genreId) => {
        const genre = genres.find((g) => g.id === genreId);
        if (!genre) return null;

        return (
            <Pill
                key={genre.id}
                withRemoveButton
                onRemove={() => handleValueRemove(genre.id)}
            >
                {genre.name}
            </Pill>
        );
    });

    const options = genres.map((genre) => (
        <Combobox.Option
            value={genre.id.toString()}
            key={genre.id}
            active={selectedGenres.includes(genre.id)}
        >
            <Group gap="sm">
                <Checkbox
                    checked={selectedGenres.includes(genre.id)}
                    onChange={() => {}}
                    aria-hidden
                    tabIndex={-1}
                    style={{ pointerEvents: "none" }}
                />
                <span>{genre.name}</span>
            </Group>
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={(val) => handleValueSelect(parseInt(val))}
            withinPortal={false}
        >
            <Combobox.DropdownTarget>
                <PillsInput pointer onClick={() => combobox.toggleDropdown()}>
                    <Pill.Group>
                        {values.length > 0 ? (
                            values
                        ) : (
                            <Input.Placeholder>Select genres</Input.Placeholder>
                        )}

                        <Combobox.EventsTarget>
                            <PillsInput.Field
                                type="hidden"
                                onBlur={() => combobox.closeDropdown()}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Backspace" &&
                                        selectedGenres.length > 0
                                    ) {
                                        event.preventDefault();
                                        handleValueRemove(
                                            selectedGenres[
                                                selectedGenres.length - 1
                                            ]
                                        );
                                    }
                                }}
                            />
                        </Combobox.EventsTarget>
                    </Pill.Group>
                </PillsInput>
            </Combobox.DropdownTarget>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
