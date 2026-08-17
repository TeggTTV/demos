import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Explore Clubs',
	description: 'Discover student organizations and campus groups. Search by interest, categories, and schedules.',
};

export default function SearchLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
