import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description:
		'Read the privacy policy, data practices, and security guidelines for student organization members and officers using the Demos club hub platform.',
	alternates: {
		canonical: '/privacy',
	},
	openGraph: {
		url: '/privacy',
		siteName: 'Demos',
		title: 'Privacy Policy',
		description:
			'Read the privacy policy, data practices, and security guidelines for student organization members and officers using the Demos club hub platform.',
		images: [
			{
				url: '/ogimage.png',
				width: 1200,
				height: 630,
				alt: 'Demos Club Platform',
			},
		],
	},
};

export default function PrivacyPage() {
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
							At Demos, we take the privacy of student club
							members and leaders seriously. This Privacy Policy
							describes how we collect, store, and protect your
							information.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							1. User Data We Collect
						</h2>
						<p>
							We collect information necessary to support club
							operations and user interaction, including:
						</p>
						<ul className="list-disc pl-5 space-y-1">
							<li>
								<strong>Account Profiles:</strong> Your name,
								campus email address, and profile picture
								(avatar).
							</li>
							<li>
								<strong>Club Membership:</strong> Your status as
								an officer or member, applications, notes, and
								direct invites.
							</li>
							<li>
								<strong>Attendance Logs:</strong> Verification
								records when you check in to club meetings or
								events.
							</li>
							<li>
								<strong>Communications:</strong> Message feeds,
								announcements, shared links, and uploaded files.
							</li>
							<li>
								<strong>System Details:</strong> Web push
								credentials if you opt in to browser
								notifications.
							</li>
						</ul>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							2. Third-Party Data Collection
						</h2>
						<p>
							We integrate third-party services to enhance and
							monitor site performance:
						</p>
						<ul className="list-disc pl-5 space-y-1">
							<li>
								<strong>Analytics:</strong> We use Vercel
								Analytics to track website performance, popular
								pages, and general traffic behavior. This data
								helps us improve user experience and includes
								device type, browser, location (at a
								country/region level), and interaction logs.
							</li>
							<li>
								<strong>Hosting &amp; Storage:</strong> Our
								platform uses database infrastructure (like
								MongoDB and Prisma) to store user and
								application records securely.
							</li>
						</ul>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							3. How Information is Used
						</h2>
						<p>
							Your information is utilized solely to facilitate
							club communication, verify meeting attendance for
							club officers, and enable student organization
							discovery across campus.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							4. Data Security &amp; Sharing
						</h2>
						<p>
							We do not sell or rent your personal data to third
							parties. Attendance records are only accessible to
							designated club officers and leaders.
						</p>

						<h2 className="text-lg font-bold text-text-primary pt-2">
							5. Your Rights &amp; Consent
						</h2>
						<p>
							By using Demos, you consent to our data collection
							policies. You have the right to request deletion of
							your account and related participation history at
							any time.
						</p>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
