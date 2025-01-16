import {Button, Input} from "@mantine/core";
import {ImageIcon} from "lucide-react";
import React, {useRef} from "react";

interface BannerUploadProps {
    onImageSelect: (file: File) => void;
}

export function BannerUpload({ onImageSelect }: BannerUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    return (
        <>
            <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
            />
            <Button
                leftSection={<ImageIcon size={16} />}
                onClick={() => fileInputRef.current?.click()}
            >
                Upload banner
            </Button>
        </>
    );
}
