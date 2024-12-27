import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { Space, Title, TextInput, Button, Stack } from "@mantine/core";
import { PageProps } from "@/types";
import BoundedContainer from "@/Components/BoundedContainer";
import { z } from "zod";

const usernameSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(16, "Username cannot exceed 16 characters")
        .trim(),
});

function Settings({ auth }: PageProps) {
    const form = useForm({
        username: auth.user.username,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = usernameSchema.safeParse({
            username: form.data.username,
        });

        if (!result.success) {
            form.setError("username", result.error.errors[0].message);
            return;
        }

        form.patch(route("settings.username.update"), {
            preserveScroll: true,
        });
    };

    const isFormValid = () => {
        const result = usernameSchema.safeParse({
            username: form.data.username,
        });
        return result.success && form.data.username !== auth.user.username;
    };

    return (
        <>
            <Head title="Settings" />
            <Space h={84} />
            <BoundedContainer>
                <Title mb="lg">Settings for {auth.user.username}</Title>

                <form onSubmit={handleSubmit}>
                    <Stack w={400}>
                        <TextInput
                            label="Username"
                            value={form.data.username}
                            onChange={(e) => {
                                form.clearErrors();
                                form.setData("username", e.target.value);
                            }}
                            error={form.errors.username}
                            disabled={form.processing}
                        />
                        <Button
                            type="submit"
                            loading={form.processing}
                            disabled={form.processing || !isFormValid()}
                        >
                            Update Username
                        </Button>
                    </Stack>
                </form>
            </BoundedContainer>
        </>
    );
}

Settings.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Settings;
