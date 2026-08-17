'use client';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { useAppContext } from '@/components/AppContext';

export default function PrivacyPage() {
	const { hydrated } = useAppContext();
	if (!hydrated) return null;

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />
			<main className="grow mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12 prose dark:prose-invert">
				<div className="rounded-2xl border border-border bg-surface p-8 shadow-sm space-y-6">
					<h1 className="text-3xl font-extrabold text-text-primary">
						Privacy Policy
					</h1>
					<p className="text-xs text-text-muted">
						Last updated: August 2026
					</p>

					<div className="space-y-4 text-sm text-text-secondary leading-relaxed">
						<p>
							At Demos, we take the privacy of student club members and
							leaders seriously. This Privacy Policy describes how we
							collect, store, and protect your information.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							1. Information We Collect
						</h2>
						<p>
							We collect information necessary to support club
							operations, including your name, campus email, display
							avatar, club memberships, meeting attendance check-in
							records, and messages shared within club hubs.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							2. How Information is Used
						</h2>
						<p>
							Your information is utilized solely to facilitate club
							communication, verify meeting attendance for club officers,
							and enable student organization discovery across campus.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							3. Data Security &amp; Sharing
						</h2>
						<p>
							We do not sell or rent your personal data to third
							parties. Attendance records are only accessible to designated
							club officers and leaders.
						</p>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
