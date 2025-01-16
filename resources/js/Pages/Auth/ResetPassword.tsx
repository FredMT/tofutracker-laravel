import {Head, useForm} from "@inertiajs/react";
import {Box, Button, Container, Group, Image, PasswordInput, Stack, TextInput, Title,} from "@mantine/core";
import {FormEventHandler} from "react";
import styles from "./Login.module.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";

export default function ResetPassword({
    token,
    email,
    backdropImage,
}: {
    token: string;
    email: string;
    backdropImage: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Reset Password" />
            <div className={styles.pageWrapper}>
                <Container size="100%" p={0} className={styles.container}>
                    <Group
                        h="100%"
                        wrap="nowrap"
                        className={styles.contentWrapper}
                    >
                        <Box className={styles.formSection}>
                            <Stack
                                w="100%"
                                maw={350}
                                mx="auto"
                                className={styles.formWrapper}
                            >
                                <Title>Reset Password</Title>

                                <form onSubmit={submit}>
                                    <Stack>
                                        <TextInput
                                            id="email"
                                            label="Email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            required
                                            error={errors.email}
                                            autoComplete="username"
                                        />

                                        <PasswordInput
                                            id="password"
                                            label="Password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            required
                                            error={errors.password}
                                            autoComplete="new-password"
                                            autoFocus
                                        />

                                        <PasswordInput
                                            id="password_confirmation"
                                            label="Confirm Password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                            required
                                            error={errors.password_confirmation}
                                            autoComplete="new-password"
                                        />

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            fullWidth
                                        >
                                            Reset Password
                                        </Button>
                                    </Stack>
                                </form>
                            </Stack>
                        </Box>
                        <Box className={styles.imageSection}>
                            <Image
                                src={`https://image.tmdb.org/t/p/original${backdropImage}`}
                                alt="Reset password background"
                                className={styles.backgroundImage}
                                loading="lazy"
                            />
                        </Box>
                    </Group>
                </Container>
            </div>
        </>
    );
}

ResetPassword.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);
