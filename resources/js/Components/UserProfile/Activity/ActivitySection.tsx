import { router, usePage } from "@inertiajs/react";
import { Card, Stack, Text } from "@mantine/core";
import { PageProps as InertiaPageProps } from "@inertiajs/core";
import { ActivityListItem } from "@/Components/UserProfile/Activity/ActivityListItem";
import { useIntersection } from "@mantine/hooks";
import React from "react";

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Activity {
    activity_type: string;
    id: number;
    description: string;
    occurred_at_diff: string;
    metadata: Record<string, any>;
}

interface PaginationData {
    current_page: number;
    data: Activity[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Props extends InertiaPageProps {
    activities: Activity[];
    activities_pagination: PaginationData;
}

export default function ActivitySection() {
    const { activities, activities_pagination } = usePage<Props>().props;
    const { ref, entry } = useIntersection({
        threshold: 1,
    });

    console.log(activities);
    React.useEffect(() => {
        if (
            entry?.isIntersecting &&
            activities_pagination.current_page < activities_pagination.last_page
        ) {
            handleLoadMore();
        }
    }, [entry?.isIntersecting]);

    const handleLoadMore = () => {
        router.reload({
            data: { page: activities_pagination.current_page + 1 },
            only: ["activities", "activities_pagination"],
            onSuccess: () => {
                const url = new URL(window.location.href);
                url.searchParams.delete("page");
                window.history.pushState({}, "", url);
            },
        });
    };

    return (
        <Stack>
            {activities
                .sort((a, b) => {
                    return (
                        new Date(b.occurred_at_diff).getTime() -
                        new Date(a.occurred_at_diff).getTime()
                    );
                })
                .map((activity) => (
                    <ActivityListItem key={activity.id} activity={activity} />
                ))}

            {activities_pagination.current_page <
                activities_pagination.last_page && (
                <Card
                    ref={ref}
                    radius="md"
                    withBorder={false}
                    bg="transparent"
                    py={2}
                    px={0}
                >
                    <Text>Loading more...</Text>
                </Card>
            )}
        </Stack>
    );
}
