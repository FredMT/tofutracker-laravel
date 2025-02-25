import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";

export function useUser() {
    const { auth } = usePage<PageProps>().props;
    return auth.user;
}
