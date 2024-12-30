import { Head, Link, useForm } from "@inertiajs/react";
import {
    Anchor,
    Button,
    Container,
    Group,
    Image,
    TextInput,
    Title,
    Box,
    Stack,
    Text,
} from "@mantine/core";
import { FormEventHandler } from "react";
import styles from "./Login.module.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";

export default function ForgotPassword({
    status,
    backdropImage,
}: {
    status?: string;
    backdropImage: string;
}) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <>
            <Head title="Forgot Password" />
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
                                <Anchor
                                    component={Link}
                                    size="sm"
                                    href="/login"
                                >
                                    Back to login
                                </Anchor>

                                <Text size="sm" c="dimmed">
                                    Forgot your password? No problem. Just let
                                    us know your email address and we will email
                                    you a password reset link that will allow
                                    you to choose a new one.
                                </Text>

                                {status && (
                                    <Text size="sm" c="green">
                                        {status}
                                    </Text>
                                )}

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
                                            autoFocus
                                        />

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            fullWidth
                                        >
                                            Email Password Reset Link
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

ForgotPassword.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);
