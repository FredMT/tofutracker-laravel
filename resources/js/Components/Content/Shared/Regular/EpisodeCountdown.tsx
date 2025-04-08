import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Text } from '@mantine/core';

interface CountdownTime {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

export function EpisodeCountdown({ timestamp }: { timestamp: number }) {
	const [countdown, setCountdown] = useState<CountdownTime>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = dayjs();
			const target = dayjs.unix(timestamp);
			const diff = target.diff(now, 'second');

			if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

			const days = Math.floor(diff / (3600 * 24));
			const hours = Math.floor((diff % (3600 * 24)) / 3600);
			const minutes = Math.floor((diff % 3600) / 60);
			const seconds = diff % 60;

			return { days, hours, minutes, seconds };
		};

		const timer = setInterval(() => {
			setCountdown(calculateTimeLeft());
		}, 1000);

		setCountdown(calculateTimeLeft());

		return () => clearInterval(timer);
	}, [timestamp]);

	if (
		countdown.days === 0 &&
		countdown.hours === 0 &&
		countdown.minutes === 0 &&
		countdown.seconds === 0
	) {
		return null;
	}

	return (
		<Text c='violet.6'>
			Next episode in: {countdown.days > 0 ? `${countdown.days}d ` : ''}
			{countdown.hours}h {countdown.minutes}m {countdown.seconds}s
		</Text>
	);
}
