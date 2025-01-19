import { Select } from "@mantine/core";
import { useSortAndFiltersStore } from "@/stores/sortAndFiltersStore";
import { useEffect, useMemo } from "react";

function ReleasedSelect() {
    const { released, setReleased, updateUrlAndNavigate } =
        useSortAndFiltersStore();

    const currentYear = new Date().getFullYear();

    const options = useMemo(() => {
        // Recent periods
        const recentOptions = [
            {
                label: "Last 7 days",
                value: "7d",
            },
            {
                label: "Last 30 days",
                value: "1m",
            },
        ];

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

        // Individual years (current year and last 4 years)
        const yearOptions = Array.from({ length: 5 }, (_, i) => ({
            label: `${currentYear - i}`,
            value: `${currentYear - i}`,
        }));

        // Decades
        const decadeOptions = Array.from({ length: 6 }, (_, i) => {
            const decade = 2020 - i * 10;
            return {
                label: `${decade}s`,
                value: `${decade}s`,
            };
        });

        return [
            {
                group: "Recent",
                items: recentOptions,
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
            {
                group: "Other",
                items: [
                    {
                        label: "Any year",
                        value: "any",
                    },
                ],
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
