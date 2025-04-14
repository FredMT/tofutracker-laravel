import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

interface ColorPoint {
	r: number;
	g: number;
	b: number;
	a: number;
}

export function useNavbarColor() {
	const { navbar_color } = useTypedPageProps();

	if (
		!navbar_color ||
		!Array.isArray(navbar_color) ||
		navbar_color.length === 0
	) {
		return {
			backgroundStyle: 'bg-white/30',
			gradientStyle: '',
		};
	}

	const gradientColors = navbar_color.map(
		(color: ColorPoint) => `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`
	);

	const gradientStyle = `linear-gradient(
		135deg,
		${gradientColors.join(',\n    ')}
	)`;

	return {
		backgroundStyle: 'bg-transparent',
		gradientStyle,
	};
}
