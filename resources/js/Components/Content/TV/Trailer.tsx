import { Trailer as TrailerType } from "@/types";
import { AspectRatio, Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Video } from "lucide-react";

function Trailer({ trailer }: { trailer: TrailerType }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Button
                onClick={open}
                leftSection={<Video size={16} />}
                variant="outline"
                color="pink"
            >
                Watch Trailer
            </Button>
            <Modal
                opened={opened}
                onClose={close}
                title={trailer.name}
                size={"70%"}
            >
                <AspectRatio ratio={16 / 9}>
                    <iframe
                        src={trailer.link}
                        title={trailer.name}
                        style={{ border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </AspectRatio>
            </Modal>
        </>
    );
}

export default Trailer;
