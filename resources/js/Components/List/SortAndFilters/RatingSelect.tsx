import { Select, Group, Text } from "@mantine/core";
import { useSortAndFiltersStore } from "@/stores/sortAndFiltersStore";
import { Star } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface RatingOption {
    value: string;
    label: string;
    labelElement: ReactNode;
}

const RatingLabel = ({ label }: { label: string }) => (
    <Group gap={8}>
        <Text size="sm">{label}</Text>
        {label !== "Any Rating" && <Star size={14} />}
    </Group>
);

const ratingOptions: RatingOption[] = [
    {
        value: "any",
        label: "Any Rating",
        labelElement: <RatingLabel label="Any Rating" />,
    },
    { value: "5", label: "5-10", labelElement: <RatingLabel label="5 - 10" /> },
    { value: "6", label: "6-10", labelElement: <RatingLabel label="6 - 10" /> },
    { value: "7", label: "7-10", labelElement: <RatingLabel label="7 - 10" /> },
    { value: "8", label: "8-10", labelElement: <RatingLabel label="8 - 10" /> },
    { value: "9", label: "9-10", labelElement: <RatingLabel label="9 - 10" /> },
];

function RatingSelect() {
    const { minRating, setMinRating, updateUrlAndNavigate } =
        useSortAndFiltersStore();

    useEffect(() => {
        if (!minRating) {
            setMinRating("any");
        }
    }, [minRating, setMinRating]);

    const handleChange = (value: string | null) => {
        setMinRating(value === "any" ? null : value);
        updateUrlAndNavigate();
    };

    return (
        <Select
            label="Rating"
            value={minRating || "any"}
            onChange={handleChange}
            data={ratingOptions.map(({ value, label }) => ({ value, label }))}
            placeholder="Rating"
            clearable={false}
            w={120}
            comboboxProps={{ width: 150, position: "bottom-start" }}
            renderOption={({ option }) => {
                const optionData = ratingOptions.find(
                    (item) => item.value === option.value
                );
                return optionData?.labelElement;
            }}
        />
    );
}

export default RatingSelect;
