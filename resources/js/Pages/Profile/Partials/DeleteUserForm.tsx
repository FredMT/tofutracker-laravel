import {useForm} from "@inertiajs/react";
import {FormEventHandler, useRef, useState} from "react";
import {Button, Group, Modal, PasswordInput, Stack, Text, Title,} from "@mantine/core";

export default function DeleteUserForm({
    className = "",
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: "",
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <Stack>
                <div>
                    <Text size="sm" c="dimmed">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Before deleting your
                        account, please download any data or information that
                        you wish to retain.
                    </Text>
                </div>

                <Button color="red" onClick={confirmUserDeletion} maw={350}>
                    Delete Account
                </Button>

                <Modal
                    opened={confirmingUserDeletion}
                    onClose={closeModal}
                    title={
                        <Title order={2}>
                            Are you sure you want to delete your account?
                        </Title>
                    }
                    centered
                >
                    <form onSubmit={deleteUser}>
                        <Stack>
                            <Text size="sm" c="dimmed">
                                Once your account is deleted, all of its
                                resources and data will be permanently deleted.
                                Please enter your password to confirm you would
                                like to permanently delete your account.
                            </Text>

                            <PasswordInput
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="Password"
                                error={errors.password}
                            />

                            <Group justify="flex-end">
                                <Button variant="default" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button
                                    color="red"
                                    type="submit"
                                    loading={processing}
                                >
                                    Delete Account
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Modal>
            </Stack>
        </section>
    );
}
