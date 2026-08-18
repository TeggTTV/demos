import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Authentication',
	alternates: {
		canonical: '/auth/login',
	},
	openGraph: {
		url: '/auth/login',
	},
	robots: {
		index: false,
		follow: true,
	},
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
