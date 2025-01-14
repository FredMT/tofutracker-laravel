import { useForm, usePage, Link } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { PageProps } from "@/types";
import { Button, TextInput, Stack, Title, Text, Box } from "@mantine/core";
import { z } from "zod";

const usernameSchema = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(16, "Username must be at most 16 characters")
    .refine((value) => !/^\d+$/.test(value), {
        message: "Username cannot contain only numbers",
    });

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;
    const { data, setData, patch, errors, processing } = useForm({
        email: user.email,
        username: user.username,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        try {
            usernameSchema.parse(data.username);
            patch(route("profile.update"));
        } catch (error) {
            if (error instanceof z.ZodError) {
                return;
            }
        }
    };

    return (
        <section className={className}>
            <Stack>
                <div>
                    <Title order={4}>Profile Information</Title>
                    <Text size="sm" c="dimmed">
                        Update your account's profile information and email
                        address.
                    </Text>
                </div>

                <form onSubmit={submit}>
                    <Stack gap="md">
                        <TextInput
                            label="Username"
                            id="username"
                            value={data.username}
                            onChange={(e) =>
                                setData("username", e.target.value)
                            }
                            required
                            autoComplete="username"
                            error={errors.username}
                            maw={350}
                            description="Username must be between 3 and 16 characters and cannot contain only numbers."
                        />

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <Box>
                                <Text size="sm">
                                    Your email address is unverified.{" "}
                                    <Link
                                        href={route("verification.send")}
                                        method="post"
                                        as="button"
                                        className="underline hover:text-gray-900"
                                    >
                                        Click here to re-send the verification
                                        email.
                                    </Link>
                                </Text>

                                {status === "verification-link-sent" && (
                                    <Text size="sm" c="green" mt="xs">
                                        A new verification link has been sent to
                                        your email address.
                                    </Text>
                                )}
                            </Box>
                        )}

                        <Button
                            type="submit"
                            loading={processing}
                            disabled={
                                processing ||
                                data.username === user.username ||
                                !usernameSchema.safeParse(data.username).success
                            }
                            maw={350}
                        >
                            Save
                        </Button>

                        {data.username === user.username && (
                            <Text size="sm" c="dimmed">
                                Enter a different username to save changes.
                            </Text>
                        )}
                    </Stack>
                </form>
            </Stack>
        </section>
    );
}
