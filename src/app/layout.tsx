import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/AppContext';
import { Analytics } from '@vercel/analytics/react';

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	themeColor: '#4f46e5',
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
	title: {
		default: 'Demos - Campus Clubs, Member Recruitment & Attendance Tracking',
		template: '%s | Demos',
	},
	description:
		'The all-in-one platform for student organizations and campus clubs to promote themselves, invite members, share announcements, and track attendance.',
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ||
			process.env.SITE_URL ||
			'https://demosclubhub.vercel.app',
	),
	manifest: '/manifest.json',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Demos',
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://demosclubhub.vercel.app/',
		siteName: 'Demos',
		title: 'Demos - Campus Clubs, Member Recruitment & Attendance Tracking',
		description:
			'Promote your club, recruit members, collaborate in hubs, and track meeting attendance seamlessly.',
		images: [
			{
				url: '/ogimage.png',
				width: 1200,
				height: 630,
				alt: 'Demos Club Platform',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Demos - Campus Clubs, Member Recruitment & Attendance Tracking',
		description:
			'The all-in-one platform for student organizations to promote themselves, recruit members, and track meeting attendance.',
		images: ['/ogtwitter.png'],
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
				<meta name="application-name" content="Demos" />
				<meta name="apple-mobile-web-app-title" content="Demos" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="default"
				/>
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="theme-color" content="#4f46e5" />
				<link rel="manifest" href="/manifest.json" />
			</head>
			<body
				className="min-h-full flex flex-col bg-background text-foreground font-sans"
				suppressHydrationWarning
			>
				<AppProvider>{children}</AppProvider>
				<Analytics />
			</body>
		</html>
	);
}
