import {
    Group,
    Text,
    rem,
    Image,
    Button,
    Box,
    Stack,
    Title,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { ImagesIcon, LucideUpload, X } from "lucide-react";
import { PageProps } from "@/types";

export default function UpdateAvatarForm() {
    const [preview, setPreview] = useState<string | null>(null);
    const { data, setData, post, progress, processing } = useForm({
        avatar: null as File | null,
    });

    const currentAvatar = usePage<PageProps>().props.auth.user.avatar
        ? "https://tofutracker.fra1.digitaloceanspaces.com/" +
          usePage<PageProps>().props.auth.user.avatar
        : null;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route("profile.avatar"), {
            onSuccess: () => {
                if (preview) {
                    URL.revokeObjectURL(preview);
                    setPreview(null);
                }
                setData("avatar", null);
            },
            preserveScroll: true,
        });
    }

    function handleFileChange(files: File[]) {
        const file = files[0];
        if (file) {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
            setPreview(URL.createObjectURL(file));
            setData("avatar", file);
        }
    }

    return (
        <Stack>
            <Title>Update Avatar</Title>
            <Text>Add or update your profile picture.</Text>

            <form onSubmit={submit}>
                <Group align="start">
                    <Dropzone
                        onDrop={handleFileChange}
                        accept={IMAGE_MIME_TYPE}
                        maxSize={3 * 1024 * 1024} // 3MB
                        loading={processing}
                        style={{
                            width: 200,
                            height: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Group
                            gap="xs"
                            style={{
                                pointerEvents: "none",
                                textAlign: "center",
                            }}
                        >
                            <Stack align="center" gap="xs">
                                <Dropzone.Accept>
                                    <LucideUpload size={40} />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <X size={40} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <Stack>
                                        <Text size="sm">
                                            Drag image here or click to select
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            File should not exceed 3MB
                                        </Text>
                                    </Stack>
                                </Dropzone.Idle>

                                <Text size="xs" c="dimmed">
                                    Suggested image size: 200x200
                                </Text>
                            </Stack>
                        </Group>
                    </Dropzone>

                    <Group align="start">
                        {preview && (
                            <Stack>
                                <Image
                                    src={preview}
                                    alt="New Avatar"
                                    maw={200}
                                    width={200}
                                    radius="md"
                                />
                                <Text size="xs" c="dimmed">
                                    Preview Avatar
                                </Text>
                            </Stack>
                        )}
                        {currentAvatar && (
                            <Stack maw={200}>
                                <Image
                                    src={currentAvatar}
                                    alt="Current Avatar"
                                    width={200}
                                    height={200}
                                    radius="md"
                                />
                                <Text size="xs" c="dimmed">
                                    Current Avatar
                                </Text>
                            </Stack>
                        )}
                    </Group>
                </Group>
                <div className="mt-4">
                    <Button type="submit" disabled={!data.avatar || processing}>
                        Upload Avatar
                    </Button>
                </div>
            </form>
        </Stack>
    );
}
