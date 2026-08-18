import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Profile Settings',
	alternates: {
		canonical: '/profile',
	},
	openGraph: {
		url: '/profile',
	},
	robots: {
		index: false,
		follow: true,
	},
};

export default function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
