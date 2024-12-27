import { Head, useForm } from "@inertiajs/react";
import {
    Button,
    Container,
    Group,
    Image,
    PasswordInput,
    Title,
    Box,
    Stack,
    Text,
} from "@mantine/core";
import { FormEventHandler } from "react";
import styles from "./Login.module.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";

export default function ConfirmPassword({
    backdropImage,
}: {
    backdropImage: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.confirm"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Confirm Password" />
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
                                <Title>Confirm Password</Title>

                                <Text size="sm" c="dimmed">
                                    This is a secure area of the application.
                                    Please confirm your password before
                                    continuing.
                                </Text>

                                <form onSubmit={submit}>
                                    <Stack>
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
                                            autoFocus
                                        />

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            fullWidth
                                        >
                                            Confirm
                                        </Button>
                                    </Stack>
                                </form>
                            </Stack>
                        </Box>
                        <Box className={styles.imageSection}>
                            <Image
                                src={`https://image.tmdb.org/t/p/original${backdropImage}`}
                                alt="Confirm password background"
                                className={styles.backgroundImage}
                            />
                        </Box>
                    </Group>
                </Container>
            </div>
        </>
    );
}

ConfirmPassword.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);
