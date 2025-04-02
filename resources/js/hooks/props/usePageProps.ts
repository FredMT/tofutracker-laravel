import { usePage } from "@inertiajs/react";

export function usePageProps<T>() {
    return usePage<{ props: T }>().props;
}
