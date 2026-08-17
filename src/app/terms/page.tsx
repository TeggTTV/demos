import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
	title: 'Terms of Service',
	description: 'Terms of Service and usage guidelines for the Demos club hub platform.',
	alternates: {
		canonical: '/terms',
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
							Welcome to Demos. By accessing or using our
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
							3. Limitation of Liability
						</h2>
						<p>
							Demos provides services &quot;as is&quot; to assist
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
