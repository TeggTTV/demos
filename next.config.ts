import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'images.pexels.com',
			},
			{
				protocol: 'https',
				hostname: 'plus.unsplash.com',
			},
		],
	},
	devIndicators: false,
	allowedDevOrigins: ['192.168.1.93', 'localhost'],
};

export default nextConfig;
