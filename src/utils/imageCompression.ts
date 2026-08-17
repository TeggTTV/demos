/**
 * Compresses and resizes an image file client-side using HTML5 Canvas.
 * Returns a Promise that resolves to a compressed base64 JPEG data URL.
 */
export function compressImage(
	file: File,
	maxWidth = 256,
	maxHeight = 256,
	quality = 0.7,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = (event) => {
			const img = new globalThis.Image();
			img.src = event.target?.result as string;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				let width = img.width;
				let height = img.height;

				// Maintain aspect ratio while resizing
				if (width > height) {
					if (width > maxWidth) {
						height = Math.round((height * maxWidth) / width);
						width = maxWidth;
					}
				} else {
					if (height > maxHeight) {
						width = Math.round((width * maxHeight) / height);
						height = maxHeight;
					}
				}

				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Could not get 2D canvas context'));
					return;
				}

				// Draw the image scaled to the new dimensions
				ctx.drawImage(img, 0, 0, width, height);

				// Export canvas as a compressed JPEG data URL
				const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
				resolve(compressedDataUrl);
			};
			img.onerror = (err) => reject(err);
		};
		reader.onerror = (err) => reject(err);
	});
}
