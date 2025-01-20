import { Select } from "@mantine/core";
import { useSortAndFiltersStore } from "@/stores/sortAndFiltersStore";
import { useEffect, useMemo } from "react";

function ReleasedSelect() {
    const { released, setReleased, updateUrlAndNavigate } =
        useSortAndFiltersStore();

    const currentYear = new Date().getFullYear();

    const options = useMemo(() => {
        const monthsAndYearsOptions = [
            {
                label: "Last 12 months",
                value: "1y",
            },
            {
                label: "Last 5 years",
                value: "5y",
            },
        ];

        const yearOptions = Array.from({ length: 5 }, (_, i) => ({
            label: `${currentYear - i}`,
            value: `${currentYear - i}`,
        }));

        const decadeOptions = Array.from({ length: 6 }, (_, i) => {
            const decade = 2020 - i * 10;
            return {
                label: `${decade}s`,
                value: `${decade}s`,
            };
        });

        return [
            {
                group: "Other",
                items: [
                    {
                        label: "Any year",
                        value: "any",
                    },
                ],
            },
            {
                group: "Periods",
                items: monthsAndYearsOptions,
            },
            {
                group: "Years",
                items: yearOptions,
            },
            {
                group: "Decades",
                items: decadeOptions,
            },
        ];
    }, [currentYear]);

    useEffect(() => {
        if (!released) {
            setReleased("any");
        }
    }, [released, setReleased]);

    const handleChange = (value: string | null) => {
        setReleased(value);
        updateUrlAndNavigate();
    };

    return (
        <Select
            label="Released"
            data={options}
            value={released || "any"}
            onChange={handleChange}
            placeholder="Released"
            clearable={false}
            w="150"
            comboboxProps={{ width: 150, position: "bottom-start" }}
        />
    );
}

export default ReleasedSelect;
