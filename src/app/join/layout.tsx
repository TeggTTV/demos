import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Join Organization',
	alternates: {
		canonical: '/join',
	},
	openGraph: {
		url: '/join',
	},
	robots: {
		index: false,
		follow: true,
	},
};

export default function JoinLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
