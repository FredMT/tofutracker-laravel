import { Link } from '@inertiajs/react';
import { Image, Title } from '@mantine/core';

export default function Logo() {
	return (
		<div className='flex'>
			<div className='flex shrink-0 items-center'>
				<Link href='/'>
					<Image
						src='/tofutrackerlogopopcorn.svg'
						h={60}
						w={60}
					/>
				</Link>
			</div>
		</div>
	);
}
