import { Title } from "@mantine/core";

export default function Error({ status }: { status: 403 | 404 | 500 | 503 }) {
    const title = {
        503: "503: Service Unavailable",
        500: "500: Server Error",
        404: "404: Page Not Found",
        403: "403: Forbidden",
    }[status];

    const description = {
        503: "Sorry, we are doing some maintenance. Please check back soon.",
        500: "Whoops, something went wrong on our servers.",
        404: "Sorry, the page you are looking for could not be found.",
        403: "Sorry, you are forbidden from accessing this page.",
        400: "Sorry, the page you are looking for could not be found.",
    }[status];

    return (
        <div>
            <Title>{title}</Title>
            <div>{description}</div>
        </div>
    );
}
