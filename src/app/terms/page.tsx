import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
	title: 'Terms of Service',

	description:
		'Read the terms of service and usage guidelines for student organizations, members, and officers using the Deimos club management platform.',
	alternates: {
		canonical: '/terms',
	},
	openGraph: {
		url: '/terms',
		siteName: 'Deimos Club Management',
		title: 'Terms of Service',
		description:
			'Read the terms of service and usage guidelines for student organizations, members, and officers using the Deimos club management platform.',
		images: [
			{
				url: '/ogimage.png',
				width: 1200,
				height: 630,
				alt: 'Deimos Club Management',
			},
		],
	},
};

export default function TermsPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />
			<main className="grow mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12 prose dark:prose-invert">
				<div className="rounded-2xl border border-border bg-surface p-8 shadow-sm space-y-6">
					<h1 className="text-3xl font-extrabold text-text-primary">
						Terms of Service
					</h1>
					<p className="text-xs text-text-muted">
						Last updated: August 2026
					</p>

					<div className="space-y-4 text-sm text-text-secondary leading-relaxed">
						<p>
							Welcome to Deimos. By accessing or using our
							platform, you agree to comply with and be bound by
							these Terms of Service.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							1. User Accounts &amp; Club Leadership
						</h2>
						<p>
							You must register using a valid educational email.
							You are responsible for maintaining the
							confidentiality of your account credentials and the
							integrity of meeting attendance tracking for clubs
							you lead.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							2. Acceptable Conduct
						</h2>
						<p>
							Users must engage respectfully. Harassment, spam,
							unauthorized distribution of confidential files, or
							falsification of attendance records will result in
							immediate termination of club leadership and
							membership privileges.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							3. Organization Visibility &amp; Privacy Settings
						</h2>
						<p>
							Club officers are responsible for properly configuring their organization&apos;s visibility settings. Organizations marked as public will have their profile and showcase information made accessible to guest visitors and site members on the campus directory. Organizations desiring restricted access must enable the Private setting, which disallows non-members and unauthorized guests from viewing the club management.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							4. Limitation of Liability
						</h2>
						<p>
							Deimos provides services &quot;as is&quot; to assist
							student organizations with promotion, communication,
							and attendance logging.
						</p>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
