import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/AppContext';

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
};

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Demos - Campus Clubs, Member Recruitment & Attendance Tracking',
	description:
		'The all-in-one platform for student organizations and campus clubs to promote themselves, invite members, share announcements, and track attendance.',
	metadataBase: new URL('https://demos-clubs.edu'),
	alternates: {
		canonical: '/',
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://demos-clubs.edu/',
		siteName: 'Demos',
		title: 'Demos - Campus Clubs, Member Recruitment & Attendance Tracking',
		description:
			'Promote your club, recruit members, collaborate in hubs, and track meeting attendance seamlessly.',
	},
	robots: {
		index: true,
		follow: true,
	},
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/icon0.svg', type: 'image/svg+xml' },
			{ url: '/icon1.png', type: 'image/png', sizes: '32x32' },
		],
		apple: [
			{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
		],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<head>
				<meta name="apple-mobile-web-app-title" content="Demos" />
			</head>
			<body
				className="min-h-full flex flex-col bg-background text-foreground font-sans"
				suppressHydrationWarning
			>
				<AppProvider>{children}</AppProvider>
			</body>
		</html>
	);
}
