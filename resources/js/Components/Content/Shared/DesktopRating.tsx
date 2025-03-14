import { Group, Modal, Rating as MantineRating, Title } from "@mantine/core";
import { RatingProps } from "../../ContentActions/components/Rating/types";
import { RatingSubmitButton } from "../../ContentActions/components/Rating/RatingSubmitButton";
import { RatingStar } from "../../ContentActions/components/Rating/RatingStar";

export function DesktopRating({
    opened,
    close,
    rating,
    setRating,
    title,
    onSubmit,
    processing,
}: RatingProps & { onSubmit: () => void }) {
    return (
        <Modal
            opened={opened}
            onClose={close}
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
                        Rate: {title}
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
