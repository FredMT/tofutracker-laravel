import {useForm as useInertiaForm} from "@inertiajs/react";
import {useEffect} from "react";

export default function useForm<T extends Record<string, any>>(
    initialData: T,
    options?: {
        onSubmit?: (data: T) => void;
        watchFields?: (keyof T)[];
    }
) {
    const form = useInertiaForm(initialData);

    // Watch for changes in specific fields and trigger submission
    useEffect(() => {
        if (options?.onSubmit && !form.processing) {
            if (options.watchFields) {
                // Only trigger if watched fields have changed
                const hasChanges = options.watchFields.some(
                    (field) => form.data[field] !== initialData[field]
                );
                if (hasChanges) {
                    options.onSubmit(form.data);
                }
            } else {
                // If no specific fields to watch, trigger on any data change
                options.onSubmit(form.data);
            }
        }
    }, [form.data]);

    return form;
}
