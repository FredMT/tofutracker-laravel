import {UserList} from "@/types/userCustomLists";
import {Divider, Group, Stack, Text, Title, Tooltip,} from "@mantine/core";
import ListImageSlidingGallery from "../ListImageSlidingGallery/ListImageSlidingGallery";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import {Film, Monitor, Wand} from "lucide-react";
import styles from "./UserCustomList.module.css";
import {useMediaQuery} from "@mantine/hooks";
import React from "react";
import {Link} from "@inertiajs/react";

function UserCustomList({ list }: { list: UserList }) {
    dayjs.extend(relativeTime);
    const mobileOrDesktop = useMediaQuery(
        "(max-width: 500px) or (min-width: 1000px)"
    );
    const desktop = useMediaQuery("(min-width: 1000px)");

    const mediaTypes = [
        {
            count: list.counts.movies,
            icon: Film,
            label: list.counts.movies === 1 ? "Movie" : "Movies",
        },
        {
            count: list.counts.tv,
            icon: Monitor,
            label: "TV",
        },
        {
            count: list.counts.anime,
            icon: Wand,
            label: "Anime",
        },
    ].filter((type) => type.count > 0);

    return (
        <div className="flex gap-5 max-[500px]:flex-col">
            <ListImageSlidingGallery images={list.posters} listId={list.id} />
            <Stack align="flex-start" justify="flex-start" gap={5}>
                <Group wrap="wrap" gap={8}>
                    {list.counts.total > 0 && (
                        <>
                            {`${list.counts.total} ${
                                list.counts.total === 1 ? "item" : "items"
                            }`}
                            <Divider orientation="vertical" />
                        </>
                    )}
                    <Title order={5} fw={300} c="dimmed">
                        {`Created ${dayjs(list.created_at).fromNow()}`}
                    </Title>
                    {list.updated_at && (
                        <>
                            <Divider
                                orientation="vertical"
                                className={styles.updatedTimestamp}
                            />
                            <Title
                                order={5}
                                fw={300}
                                c="dimmed"
                                className={styles.updatedTimestamp}
                            >
                                {`Updated ${dayjs(list.updated_at).fromNow()}`}
                            </Title>
                        </>
                    )}
                </Group>
                <Link href={route("list.show", list.id)}>
                    <Tooltip label={list.title}>
                        <Title order={desktop ? 2 : 4} lineClamp={2}>
                            {list.title}
                        </Title>
                    </Tooltip>
                </Link>

                {list.description && (
                    <Text lineClamp={2} size={mobileOrDesktop ? "md" : "sm"}>
                        {list.description}
                    </Text>
                )}
                <Group mt={24} visibleFrom="mdlg">
                    {mediaTypes.map((type, index) => (
                        <React.Fragment key={type.label}>
                            {index > 0 && <Divider orientation="vertical" />}
                            <Group gap={6}>
                                <type.icon />
                                <Title order={5} fw={300}>
                                    {`${type.count} ${type.label}`}
                                </Title>
                            </Group>
                        </React.Fragment>
                    ))}
                </Group>
            </Stack>
        </div>
    );
}

export default UserCustomList;
