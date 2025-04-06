import { PageProps } from "@inertiajs/core";
import { usePage } from "@inertiajs/react";

export interface TypedPageProps extends PageProps {
	data: unknown;

	[key: string]: unknown;
}

export function useTypedPageProps(): TypedPageProps {
	return usePage<TypedPageProps>().props;
}