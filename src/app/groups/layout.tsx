import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'My Clubs',
	description: 'Manage and access your registered student organizations, join codes, and administrative tools.',
};

export default function GroupsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
