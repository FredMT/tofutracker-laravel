import { useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Auth, PageProps } from "@/types";
import { Button, Stack, Text, Textarea, Title } from "@mantine/core";
import { z } from "zod";

const bioSchema = z
    .string()
    .max(160, "Bio must not exceed 160 characters")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val));

export default function UpdateBioForm() {
    const { auth } = usePage<{ auth: Auth }>().props;

    if (!auth.user) {
        return null;
    }

    const { data, setData, patch, errors, processing } = useForm({
        bio: auth.user.bio || "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        try {
            bioSchema.parse(data.bio);
            patch(route("profile.bio"));
        } catch (error) {
            if (error instanceof z.ZodError) {
                return;
            }
        }
    };

    return (
        <Stack>
            <div>
                <Title order={4}>Bio</Title>
                <Text size="sm" c="dimmed">
                    Tell others a little about yourself.
                </Text>
            </div>

            <form onSubmit={submit}>
                <Stack gap="md">
                    <Textarea
                        placeholder="Write a short bio..."
                        value={data.bio}
                        onChange={(e) => setData("bio", e.target.value)}
                        error={errors.bio}
                        maxLength={160}
                        autosize
                        minRows={3}
                        maxRows={4}
                        description={`${data.bio.length}/160 characters`}
                    />

                    <Button
                        type="submit"
                        loading={processing}
                        disabled={
                            processing ||
                            data.bio === auth.user.bio ||
                            !bioSchema.safeParse(data.bio).success
                        }
                        maw={350}
                    >
                        Save
                    </Button>

                    {data.bio === auth.user.bio && (
                        <Text size="sm" c="dimmed">
                            Make changes to your bio to save.
                        </Text>
                    )}
                </Stack>
            </form>
        </Stack>
    );
}
