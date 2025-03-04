import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Title, Text, Container, Stack, rem, Space } from "@mantine/core";

function Error({ status }: { status: 403 | 404 | 500 | 503 }) {
    const title = {
        503: "503: Service Unavailable",
        500: "500: Server Error",
        404: "404: Page Not Found",
        403: "403: Forbidden",
    }[status];

    const description = {
        503: "Sorry, we are doing some maintenance. Please check back soon.",
        500: "Whoops, something went wrong on our servers.",
        404: "Sorry, the page you are looking for could not be found.",
        403: "Sorry, you are forbidden from accessing this page.",
        400: "Sorry, the page you are looking for could not be found.",
    }[status];

    return (
        <>
            <Head title={title} />
            <Space h={64} />
            <Container size="md" py={rem(80)}>
                <Stack gap="xl" ta="center">
                    <Title order={1} size={rem(48)} fw={900} ta="center">
                        {title}
                    </Title>
                    <Text size="xl" c="dimmed" ta="center" maw={600}>
                        {description}
                    </Text>
                </Stack>
            </Container>
        </>
    );
}

Error.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Error;
