import {
	Switch,
	useComputedColorScheme,
	useMantineColorScheme,
} from '@mantine/core';
import cx from 'clsx';
import classes from './ThemeButton.module.css';
import { Moon, Sun } from 'lucide-react';

export default function ThemeButton() {
	const { setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme('light', {
		getInitialValueInEffect: true,
	});

	const isDark = computedColorScheme === 'dark';

	return (
		<Switch
			checked={isDark}
			onChange={() => setColorScheme(isDark ? 'light' : 'dark')}
			size='md'
			color='dark.4'
			onLabel={
				<Sun
					size={16}
					className='text-yellow-400'
				/>
			}
			offLabel={
				<Moon
					size={16}
					className='text-blue-600'
				/>
			}
			aria-label='Toggle color scheme'
		/>
	);
}
