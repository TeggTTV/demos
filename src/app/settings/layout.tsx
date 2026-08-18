import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'App Settings',
	alternates: {
		canonical: '/settings',
	},
	openGraph: {
		url: '/settings',
	},
	robots: {
		index: false,
		follow: true,
	},
};

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
