import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Pending Roster Requests',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PendingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
