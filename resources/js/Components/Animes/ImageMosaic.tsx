interface ImageMosaicProps {
	maxHeight?: string;
	images: string[];
	className?: string;
}

const ImageMosaic = ({
	maxHeight = '500px',
	images = [],
	className = '',
}: ImageMosaicProps) => {
	// Use provided images or fallback to defaults if fewer than 3 are provided
	const displayImages = [
		`https://image.tmdb.org/t/p/w500${images[0]}` ||
			'https://image.tmdb.org/t/p/w500/gmECX1DvFgdUPjtio2zaL8BPYPu.jpg',
		`https://image.tmdb.org/t/p/w500${images[1]}` ||
			'https://image.tmdb.org/t/p/w500/mNwz73VBP4HCY5QGXxRoCTabGTh.jpg',
		`https://image.tmdb.org/t/p/w500${images[2]}` ||
			'https://image.tmdb.org/t/p/w500/p0F2nVd9oLZQnZrP2bswqOI6NCp.jpg',
	];

	return (
		<div
			className={`container mx-auto ${className}`}
			style={{ maxHeight }}
		>
			<div className='relative flex h-full'>
				{displayImages.map((image, index) => (
					<div
						key={index}
						className='relative flex-1 overflow-hidden'
						style={{
							clipPath:
								index === 0
									? 'polygon(0 0, 100% 0, 85% 100%, 0 100%)'
									: index === 1
										? 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)'
										: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)',
						}}
					>
						<img
							src={image}
							alt={`Anime Image ${index + 1}`}
							className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default ImageMosaic;
