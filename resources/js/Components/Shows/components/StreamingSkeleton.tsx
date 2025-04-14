import { LoadingOverlay } from '@mantine/core';

export const StreamingSkeleton = () => {
	return (
		<div style={{ position: 'relative', minHeight: '400px' }}>
			<LoadingOverlay
				visible={true}
				loaderProps={{ color: 'grape', type: 'bars' }}
				zIndex={1000}
				overlayProps={{ radius: 'md' }}
			/>
		</div>
	);
};
