/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.SITE_URL || 'https://demosclubhub.vercel.app',
	generateRobotsTxt: true,
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
			},
		],
	},
	exclude: [
		'/auth/*',
		'/search/',
		'/search/*',
		'/join',
		'/join/*',
		'/pending',
		'/profile',
		'/settings',
		'/groups',
		'/group/*',
		'/apple-icon.png',
		'/icon0.svg',
		'/icon1.png',
		'/manifest.json',
		'/robots.txt',
	],
};
