import FilterMobileDrawer from "@/Components/UserProfile/Filter/FilterMobileDrawer";
import FilterSearchInput from "@/Components/UserProfile/Filter/FilterSearchInput";
import { Grid } from "@mantine/core";

export default function FilterMobile() {
    return (
        <>
            <Grid columns={4} justify="center" align="center">
                <Grid.Col span={3}>
                    <FilterSearchInput />
                </Grid.Col>
                <Grid.Col span={1}>
                    <FilterMobileDrawer />
                </Grid.Col>
            </Grid>
        </>
    );
}
