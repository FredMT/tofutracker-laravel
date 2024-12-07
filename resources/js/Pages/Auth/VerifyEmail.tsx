import { Head, Link, useForm } from "@inertiajs/react";
import {
    Anchor,
    Button,
    Container,
    Group,
    Image,
    Stack,
    Text,
    Box,
    Alert,
} from "@mantine/core";
import { FormEventHandler } from "react";
import styles from "./VerifyEmail.module.css";

export default function VerifyEmail({
    status,
    backdropImage,
}: {
    status?: string;
    backdropImage: string;
}) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("verification.send"));
    };

    return (
        <>
            <Head title="Email Verification" />
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
                                <Text size="lg" fw={500}>
                                    Email Verification
                                </Text>

                                <Text size="sm" c="dimmed">
                                    Thanks for signing up! Before getting
                                    started, could you verify your email address
                                    by clicking on the link we just emailed to
                                    you? If you didn't receive the email, we
                                    will gladly send you another.
                                </Text>

                                {status === "verification-link-sent" && (
                                    <Alert color="green" variant="light">
                                        A new verification link has been sent to
                                        the email address you provided during
                                        registration.
                                    </Alert>
                                )}

                                <form onSubmit={submit}>
                                    <Stack>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            fullWidth
                                        >
                                            Resend Verification Email
                                        </Button>

                                        <Anchor
                                            component={Link}
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            size="sm"
                                        >
                                            Log Out
                                        </Anchor>
                                    </Stack>
                                </form>
                            </Stack>
                        </Box>
                        <Box className={styles.imageSection}>
                            <Image
                                src={`https://image.tmdb.org/t/p/original${backdropImage}`}
                                alt="Verify email background"
                                className={styles.backgroundImage}
                            />
                        </Box>
                    </Group>
                </Container>
            </div>
        </>
    );
}
