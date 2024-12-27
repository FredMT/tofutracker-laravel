import { Head, Link, useForm } from "@inertiajs/react";
import {
    Anchor,
    Button,
    Container,
    Group,
    Image,
    PasswordInput,
    Stack,
    TextInput,
    Title,
    Box,
} from "@mantine/core";
import { FormEventHandler } from "react";
import styles from "./Register.module.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";

export default function Register({ backdropImage }: { backdropImage: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Register" />
            <AuthenticatedLayout>
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
                                    <Title>Create Account</Title>
                                    <Anchor
                                        component={Link}
                                        size="sm"
                                        href="/login"
                                    >
                                        Already have an account? Login
                                    </Anchor>
                                    <form onSubmit={submit}>
                                        <Stack>
                                            <TextInput
                                                id="username"
                                                label="Username"
                                                value={data.username}
                                                onChange={(e) =>
                                                    setData(
                                                        "username",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                error={errors.username}
                                            />
                                            <TextInput
                                                id="email"
                                                label="Email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                error={errors.email}
                                            />
                                            <div className={styles.inputGroup}>
                                                <PasswordInput
                                                    label="Password"
                                                    id="password"
                                                    value={data.password}
                                                    onChange={(e) =>
                                                        setData(
                                                            "password",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    error={errors.password}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <PasswordInput
                                                    label="Confirm Password"
                                                    id="password_confirmation"
                                                    value={
                                                        data.password_confirmation
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "password_confirmation",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    error={
                                                        errors.password_confirmation
                                                    }
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                fullWidth
                                            >
                                                Register
                                            </Button>
                                        </Stack>
                                    </form>
                                </Stack>
                            </Box>
                            <Box className={styles.imageSection}>
                                <Image
                                    src={`https://image.tmdb.org/t/p/original${backdropImage}`}
                                    alt="Register background"
                                    className={styles.backgroundImage}
                                />
                            </Box>
                        </Group>
                    </Container>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
