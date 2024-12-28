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

export default function UpdateBannerForm() {
    const [preview, setPreview] = useState<string | null>(null);
    const { data, setData, post, progress, processing } = useForm({
        banner: null as File | null,
    });
    const user = usePage<PageProps>().props.auth.user;

    const currentBanner = user.banner
        ? `${import.meta.env.VITE_DO_URL}/${user.banner}`
        : null;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route("profile.banner"), {
            onSuccess: () => {
                if (preview) {
                    URL.revokeObjectURL(preview);
                    setPreview(null);
                }
                setData("banner", null);
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
            setData("banner", file);
        }
    }

    return (
        <Stack>
            <Title>Update Banner</Title>
            <Text>Add or update your profile banner.</Text>

            <form onSubmit={submit}>
                <Stack align="start">
                    <Dropzone
                        onDrop={handleFileChange}
                        accept={IMAGE_MIME_TYPE}
                        maxSize={6 * 1024 * 1024} // 3MB
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
                                            File should not exceed 6MB
                                        </Text>
                                    </Stack>
                                </Dropzone.Idle>

                                <Text size="xs" c="dimmed">
                                    Suggested image size: 1920x320
                                </Text>
                            </Stack>
                        </Group>
                    </Dropzone>

                    <Group align="start">
                        {preview && (
                            <Stack>
                                <Image
                                    src={preview}
                                    alt="New Banner"
                                    maw={530}
                                    mih={200}
                                    radius="md"
                                />
                                <Text size="xs" c="dimmed">
                                    Preview Banner
                                </Text>
                            </Stack>
                        )}
                        {currentBanner && (
                            <Stack>
                                <Image
                                    src={currentBanner}
                                    alt="Current Banner"
                                    maw={530}
                                    mih={200}
                                    radius="md"
                                />
                                <Text size="xs" c="dimmed">
                                    Current Banner
                                </Text>
                            </Stack>
                        )}
                    </Group>
                </Stack>
                <div className="mt-4">
                    <Button type="submit" disabled={!data.banner || processing}>
                        Upload Banner
                    </Button>
                </div>
            </form>
        </Stack>
    );
}
