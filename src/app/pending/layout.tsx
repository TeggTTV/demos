import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Pending Roster Requests',
	alternates: {
		canonical: '/pending',
	},
	openGraph: {
		url: '/pending',
	},
	robots: {
		index: false,
		follow: true,
	},
};

export default function PendingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
