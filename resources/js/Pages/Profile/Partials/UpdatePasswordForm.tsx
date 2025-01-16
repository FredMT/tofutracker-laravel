import {useForm} from "@inertiajs/react";
import {FormEventHandler, useRef} from "react";
import {Button, PasswordInput, Stack, Text, Title,} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {Check} from "lucide-react";

export default function UpdatePasswordForm({
    className = "",
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                notifications.show({
                    title: "Password updated successfully",
                    message: "Your password has been updated successfully.",
                    color: "green",
                    icon: <Check size={16} />,
                });
            },
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <Stack>
                <div>
                    <Title order={4}>Update Password</Title>
                    <Text size="sm" c="dimmed">
                        Ensure your account is using a long, random password to
                        stay secure.
                    </Text>
                </div>

                <form onSubmit={updatePassword}>
                    <Stack gap="md">
                        <PasswordInput
                            label="Current Password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData("current_password", e.target.value)
                            }
                            error={errors.current_password}
                            autoComplete="current-password"
                            maw={350}
                        />

                        <PasswordInput
                            label="New Password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            error={errors.password}
                            autoComplete="new-password"
                            maw={350}
                        />

                        <PasswordInput
                            label="Confirm Password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            error={errors.password_confirmation}
                            autoComplete="new-password"
                            maw={350}
                        />

                        <Button type="submit" loading={processing} maw={350}>
                            Save
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </section>
    );
}
