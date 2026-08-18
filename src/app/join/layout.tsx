import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Join Organization',
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
