import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Button, Group, Stack, Flex, Alert } from "@mantine/core";
import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Auth } from "@/types";
import { InfoIcon } from "lucide-react";
import { Link as InertiaLink } from "@inertiajs/react";

interface CommentEditorProps {
    onSave: (content: string) => void;
    onCancel?: () => void;
    isReply?: boolean;
    initialContent?: string;
}

export function CommentEditor({
    onSave,
    onCancel,
    isReply = false,
    initialContent = "",
}: CommentEditorProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [isEmpty, setIsEmpty] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [StarterKit, Underline, Link, Superscript, SubScript],
        content: initialContent,
        onUpdate: ({ editor }) => {
            setIsEmpty(editor.isEmpty);
        },
    });

    useEffect(() => {
        if (editor) {
            setIsEmpty(editor.isEmpty);
        }
    }, [editor]);

    const handleSave = async () => {
        if (editor && !isEmpty) {
            try {
                setIsSubmitting(true);
                setError(null);
                await onSave(editor.getHTML());
                editor.commands.clearContent();
            } catch (err) {
                setError("Failed to save comment. Please try again.");
                console.error("Error saving comment:", err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Stack gap={16}>
            <RichTextEditor editor={editor} variant="subtle">
                <RichTextEditor.Toolbar sticky>
                    <Flex gap={4} rowGap={4} columnGap={8} wrap="wrap">
                        <RichTextEditor.ControlsGroup>
                            <Flex gap={4}>
                                <RichTextEditor.Bold />
                                <RichTextEditor.Italic />
                                <RichTextEditor.Underline />
                                <RichTextEditor.Strikethrough />
                                <RichTextEditor.ClearFormatting />
                            </Flex>
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                            <Flex gap={4}>
                                <RichTextEditor.Blockquote />
                                <RichTextEditor.Hr />
                                <RichTextEditor.BulletList />
                                <RichTextEditor.OrderedList />
                                <RichTextEditor.Subscript />
                                <RichTextEditor.Superscript />
                            </Flex>
                        </RichTextEditor.ControlsGroup>

                        <RichTextEditor.ControlsGroup>
                            <Flex gap={4}>
                                <RichTextEditor.Link />
                                <RichTextEditor.Unlink />
                            </Flex>
                        </RichTextEditor.ControlsGroup>
                    </Flex>
                </RichTextEditor.Toolbar>

                <RichTextEditor.Content />
            </RichTextEditor>

            <Group gap="sm">
                {isReply && onCancel && (
                    <Button variant="subtle" color="gray" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button
                    onClick={handleSave}
                    loading={isSubmitting}
                    disabled={
                        isEmpty ||
                        !auth.user ||
                        !auth.user.email_verified_at ||
                        isSubmitting
                    }
                >
                    {isReply ? "Reply" : "Save"}
                </Button>
                {error && (
                    <Alert color="red" title="Error" icon={<InfoIcon />}>
                        {error}
                    </Alert>
                )}
                {!auth.user && (
                    <InertiaLink href={route("login")}>
                        <Alert
                            title="You must be logged in to comment"
                            icon={<InfoIcon />}
                        />
                    </InertiaLink>
                )}
                {auth.user && !auth.user?.email_verified_at && (
                    <InertiaLink href={route("verification.notice")}>
                        <Alert
                            title="You must verify your email to comment"
                            icon={<InfoIcon />}
                        />
                    </InertiaLink>
                )}
            </Group>
        </Stack>
    );
}
