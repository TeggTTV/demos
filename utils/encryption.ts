import crypto from 'crypto';

const SECRET_PHRASE =
	process.env.ENCRYPTION_KEY ||
	'default_deimos_secret_fallback_phrase_secure_and_long';
// Derive a 32-byte key using SHA-256 from the environmental phrase
const KEY = crypto.createHash('sha256').update(SECRET_PHRASE).digest();
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a password string using AES-256-CBC with a random initialization vector (IV).
 * Returns the encrypted string formatted as "ivHex:ciphertextHex".
 */
export function encryptPassword(password: string): string {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
	let encrypted = cipher.update(password, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a password string that was encrypted using encryptPassword.
 * If the string is not in the correct encrypted format, or if decryption fails,
 * it returns the original input string (fallback for legacy plain-text passwords).
 */
export function decryptPassword(encryptedValue: string): string {
	if (!encryptedValue || !encryptedValue.includes(':')) {
		return encryptedValue;
	}

	try {
		const parts = encryptedValue.split(':');
		if (parts.length !== 2) {
			return encryptedValue;
		}

		const [ivHex, ciphertextHex] = parts;
		const iv = Buffer.from(ivHex, 'hex');
		const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
		let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	} catch (error) {
		console.warn(
			'Decryption failed, treating as legacy plain-text password:',
			error,
		);
		return encryptedValue;
	}
}
