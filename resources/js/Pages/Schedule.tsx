import BoundedContainer from "@/Components/BoundedContainer";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Box, Space, Stack, Text, Title } from "@mantine/core";
import React from "react";

function Schedule() {
    return (
        <>
            <Head title="Schedule" />
            <Space h={72} />

            <BoundedContainer>
                <Stack gap={4}>
                    <Title order={1}>Schedule</Title>
                </Stack>
            </BoundedContainer>
        </>
    );
}

Schedule.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Schedule;
