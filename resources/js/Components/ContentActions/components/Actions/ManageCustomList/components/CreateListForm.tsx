import {Button, Group, Stack, Switch, Textarea, TextInput,} from "@mantine/core";
import {useForm, usePage} from "@inertiajs/react";

type Props = {
    closeCreate: () => void;
};

export function CreateListForm({ closeCreate }: Props) {
    const { auth } = usePage<{ auth: { user: { username: string } } }>().props;

    const form = useForm({
        title: "",
        description: "",
        is_public: true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route("user.lists.store", { username: auth.user.username }), {
            onSuccess: () => {
                form.reset();
                closeCreate();
            },
        });
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
                        onClick={closeCreate}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={form.processing}>
                        Create List
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
