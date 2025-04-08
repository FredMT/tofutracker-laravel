import { Link } from '@inertiajs/react';
import { ActionIcon } from '@mantine/core';
import { Calendar } from 'lucide-react';

function ScheduleLinkActionIcon() {
	return (
		<ActionIcon
			variant='light'
			size='lg'
			color='red'
			component={Link}
			href='/schedule'
		>
			<Calendar />
		</ActionIcon>
	);
}

export default ScheduleLinkActionIcon;
