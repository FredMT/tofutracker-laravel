import FilterMobileDrawer from "@/Components/UserProfile/Filter/FilterMobileDrawer";
import FilterSearchInput from "@/Components/UserProfile/Filter/FilterSearchInput";
import {Grid} from "@mantine/core";

interface FilterMobileProps {
    contentType: "movies" | "tv";
}

export default function FilterMobile({ contentType }: FilterMobileProps) {
    return (
        <>
            <Grid columns={4} justify="center" align="center">
                <Grid.Col span={3}>
                    <FilterSearchInput contentType={contentType} />
                </Grid.Col>
                <Grid.Col span={1}>
                    <FilterMobileDrawer contentType={contentType} />
                </Grid.Col>
            </Grid>
        </>
    );
}
