/**
 * Mock Data Toggle Configuration
 *
 * Set USE_MOCK_DATA to false (or set NEXT_PUBLIC_USE_MOCK_DATA=false in .env)
 * to instantly revert to standard MongoDB operations with zero database side-effects.
 */
export const USE_MOCK_DATA =
	process.env.NEXT_PUBLIC_USE_MOCK_DATA !== undefined
		? process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
		: true;
