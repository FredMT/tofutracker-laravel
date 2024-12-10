import { RatingStar } from "./RatingStar";
import { RatingSubmitButton } from "./RatingSubmitButton";
import { RatingProps } from "./types";
import {
    Drawer,
    Group,
    Rating as MantineRating,
    Stack,
    Title,
} from "@mantine/core";

export function MobileRating({
    opened,
    close,
    rating,
    setRating,
    content,
    onSubmit,
    processing,
}: RatingProps & { onSubmit: () => void }) {
    return (
        <Drawer
            opened={opened}
            onClose={close}
            position="bottom"
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
                <Stack>
                    <Title>Rate: {content.title}</Title>
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
                </Stack>
            </form>
        </Drawer>
    );
}