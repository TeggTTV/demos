import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Explore Clubs',
	description: 'Discover student organizations, campus clubs, and student-led interest groups. Search and filter by category, meeting times, schedules, and locations.',
	alternates: {
		canonical: '/search',
	},
};

export default function SearchLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
