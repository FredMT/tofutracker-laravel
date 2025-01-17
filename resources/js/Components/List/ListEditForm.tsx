import {
    Button,
    Group,
    Stack,
    Switch,
    Textarea,
    TextInput,
} from "@mantine/core";
import { useForm } from "@inertiajs/react";
import { ListPage } from "@/types/listPage";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

interface EditListFormProps {
    list: ListPage;
    onClose: () => void;
}

export function ListEditForm({ list, onClose }: EditListFormProps) {
    const { auth } = usePage<PageProps>().props;
    const form = useForm({
        title: list.title,
        description: list.description || "",
        is_public: list.is_public,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!auth.user) return;

        form.patch(
            route("user.lists.update", {
                username: auth.user.username,
                list: list.id,
            }),
            {
                onSuccess: () => {
                    onClose();
                },
                preserveScroll: true,
            }
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md">
                <TextInput
                    label="List Title"
                    required
                    value={form.data.title}
                    onChange={(e) =>
                        form.setData("title", e.currentTarget.value)
                    }
                    error={form.errors.title}
                />
                <Textarea
                    label="Description"
                    value={form.data.description}
                    onChange={(e) =>
                        form.setData("description", e.currentTarget.value)
                    }
                    error={form.errors.description}
                />
                <Switch
                    label="Make this list public"
                    description="Public lists can be viewed by anyone"
                    checked={form.data.is_public}
                    onChange={(e) =>
                        form.setData("is_public", e.currentTarget.checked)
                    }
                />
                <Group justify="flex-end" mt="md">
                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={form.processing}>
                        Save Changes
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
