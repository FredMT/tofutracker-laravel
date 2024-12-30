import { Head, Link, useForm } from "@inertiajs/react";
import {
    Anchor,
    Button,
    Checkbox,
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
import styles from "./Login.module.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";

function Login({
    canResetPassword,
    backdropImage,
}: {
    canResetPassword: boolean;
    backdropImage: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Log in" />
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
                                <Title>Login</Title>
                                <Anchor
                                    component={Link}
                                    size="sm"
                                    href="/register"
                                >
                                    Don't have an account? Create one
                                </Anchor>
                                <form onSubmit={handleSubmit}>
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
                                        <div className={styles.checkboxGroup}>
                                            <Checkbox
                                                defaultChecked
                                                label="Remember me"
                                            />
                                            {canResetPassword && (
                                                <Anchor
                                                    component={Link}
                                                    size="sm"
                                                    href="/forgot-password"
                                                >
                                                    Forgot password?
                                                </Anchor>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            fullWidth
                                        >
                                            Login
                                        </Button>
                                    </Stack>
                                </form>
                            </Stack>
                        </Box>
                        <Box className={styles.imageSection}>
                            <Image
                                src={`https://image.tmdb.org/t/p/original${backdropImage}`}
                                alt="Login background"
                                loading="lazy"
                                className={styles.backgroundImage}
                            />
                        </Box>
                    </Group>
                </Container>
            </div>
        </>
    );
}

Login.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Login;
