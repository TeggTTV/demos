import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/AppContext';
import { TutorialProvider } from '@/components/tutorial/TutorialContext';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import TutorialWelcomeModal from '@/components/tutorial/TutorialWelcomeModal';
import { Analytics } from '@vercel/analytics/react';
import PwaInstallBanner from '@/components/PwaInstallBanner';
import DataConsentBanner from '@/components/DataConsentBanner';

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
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
		default: 'Deimos - Club Management, Recruitment & Attendance',
		template: '%s | Deimos',
	},
	description:
		'The all-in-one platform for student organizations and campus clubs to promote themselves, invite members, share announcements, and track attendance.',
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ||
			process.env.SITE_URL ||
			'https://demosclubhub.org',
	),
	manifest: '/manifest.json',
	alternates: {
		canonical: '/',
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Deimos',
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		siteName: 'Deimos Club Management',
		url: '/',
		title: 'Deimos - Club Management, Recruitment & Attendance',
		description:
			'Promote your club, recruit members, and track meeting attendance seamlessly.',
		images: [
			{
				url: '/ogimage.png',
				width: 1200,
				height: 630,
				alt: 'Deimos Club Management',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Deimos - Club Management, Recruitment & Attendance',
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
			{
				url: '/icon1.png',
				type: 'image/png',
				sizes: '32x32',
				media: '(prefers-color-scheme: light)',
			},
			// {
			// 	url: '/icon0.svg',
			// 	type: 'image/svg+xml',
			// 	media: '(prefers-color-scheme: dark)',
			// },
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
				<meta name="application-name" content="Deimos" />
				<meta name="apple-mobile-web-app-title" content="Deimos" />
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
				<a href="#main-content" className="skip-link">
					Skip to content
				</a>
				<AppProvider>
					<TutorialProvider>
						{children}
						<TutorialOverlay />
						<TutorialWelcomeModal />
						<PwaInstallBanner />
						<DataConsentBanner />
					</TutorialProvider>
				</AppProvider>
				<Analytics />
			</body>
		</html>
	);
}
