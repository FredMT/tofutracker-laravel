import { Link } from "@inertiajs/react";
import { Title } from "@mantine/core";

export default function Logo() {
    return (
        <div className="flex">
            <div className="flex shrink-0 items-center">
                <Link href="/">
                    <Title order={2} c="white">
                        TOFUTRACKER
                    </Title>
                </Link>
            </div>
        </div>
    );
}
