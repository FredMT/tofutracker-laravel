import { Modal, Title, Group, Rating as MantineRating } from "@mantine/core";
import { RatingProps } from "./types";
import { RatingSubmitButton } from "./RatingSubmitButton";
import { RatingStar } from "./RatingStar";

export function DesktopRating({
    opened,
    close,
    rating,
    setRating,
    content,
    onSubmit,
    processing,
}: RatingProps & { onSubmit: () => void }) {
    return (
        <Modal
            opened={opened}
            onClose={close}
            centered
            size="xl"
            styles={{
                inner: { overflow: "visible" },
                content: { overflow: "visible" },
            }}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
            >
                <RatingStar rating={rating} />
                <div style={{ textAlign: "center" }}>
                    <Title style={{ marginBottom: "1rem" }}>
                        Rate: {content.title}
                    </Title>
                    <Group justify="center" mt="xl">
                        <MantineRating
                            value={rating}
                            onChange={setRating}
                            size="xl"
                            count={10}
                            style={{ marginBottom: "1rem" }}
                        />
                    </Group>
                    <Group justify="center" mt="xl">
                        <RatingSubmitButton
                            rating={rating}
                            processing={processing}
                        />
                    </Group>
                </div>
            </form>
        </Modal>
    );
}
