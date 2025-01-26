import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Button, Group, Stack, Flex } from "@mantine/core";
import { useEffect, useState } from "react";

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
    const [isEmpty, setIsEmpty] = useState(true);

    const editor = useEditor({
        extensions: [StarterKit, Underline, Link, Superscript, SubScript],
        content: initialContent,
        onUpdate: ({ editor }) => {
            // Check if editor has any content
            setIsEmpty(editor.isEmpty);
        },
    });

    // Set initial empty state
    useEffect(() => {
        if (editor) {
            setIsEmpty(editor.isEmpty);
        }
    }, [editor]);

    const handleSave = () => {
        if (editor && !isEmpty) {
            onSave(editor.getHTML());
            editor.commands.clearContent();
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
                <Button onClick={handleSave} disabled={isEmpty}>
                    Save
                </Button>
            </Group>
        </Stack>
    );
}
