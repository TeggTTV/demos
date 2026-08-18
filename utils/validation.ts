export function validateBase64Upload(
	dataUrl: string | null | undefined,
	allowedMimePrefixes: string[],
	maxSizeMb: number
): { isValid: boolean; error?: string } {
	if (!dataUrl) return { isValid: true };
	
	if (!dataUrl.startsWith('data:')) {
		// External URLs are accepted as is
		return { isValid: true };
	}

	const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
	if (!matches) {
		return { isValid: false, error: 'Invalid data URL format' };
	}

	const contentType = matches[1];
	const base64Data = matches[2];
	
	// Check content type prefix
	const isTypeAllowed = allowedMimePrefixes.some(prefix => contentType.startsWith(prefix));
	if (!isTypeAllowed) {
		return { isValid: false, error: `Invalid file type. Allowed categories: ${allowedMimePrefixes.join(', ')}` };
	}

	// Calculate size
	const sizeInBytes = (base64Data.length * 3) / 4;
	const maxSizeInBytes = maxSizeMb * 1024 * 1024;
	if (sizeInBytes > maxSizeInBytes) {
		return { isValid: false, error: `File size exceeds the limit of ${maxSizeMb}MB` };
	}

	return { isValid: true };
}
