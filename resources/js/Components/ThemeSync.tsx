import { useEffect } from 'react';
import { useComputedColorScheme } from '@mantine/core';

export default function ThemeSync() {
	const computedColorScheme = useComputedColorScheme('light', {
		getInitialValueInEffect: true,
	});

	useEffect(() => {
		const root = document.documentElement;
		if (computedColorScheme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}, [computedColorScheme]);

	return null;
}
