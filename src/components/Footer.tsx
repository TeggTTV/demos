'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
	return (
		<footer className="border-t border-border bg-surface-secondary py-8 mt-auto">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex flex-col items-center md:items-start text-center md:text-left">
						<div className="flex items-center space-x-2">
							<div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md">
								<Image
									src="/icon1.png"
									alt="Demos Logo"
									fill
									className="object-cover dark:invert"
								/>
							</div>
							<span className="text-lg font-bold tracking-tight text-primary">
								Demos
							</span>
						</div>
						<p className="text-xs text-text-muted mt-1 max-w-sm">
							The all-in-one platform for campus clubs to promote
							themselves, recruit members, collaborate, and track
							attendance.
						</p>
					</div>
					<div className="flex flex-col items-center md:items-end gap-3 text-xs text-text-muted">
						<div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2 font-medium">
							<Link
								href="/"
								className="hover:text-text-primary transition-colors"
							>
								Home
							</Link>
							<Link
								href="/search"
								className="hover:text-text-primary transition-colors"
							>
								Explore Clubs
							</Link>
							<Link
								href="/groups"
								className="hover:text-text-primary transition-colors"
							>
								My Clubs
							</Link>
							<Link
								href="/pending"
								className="hover:text-text-primary transition-colors"
							>
								Applications &amp; Invites
							</Link>
							<Link
								href="/terms"
								className="hover:text-text-primary transition-colors"
							>
								Terms of Service
							</Link>
							<Link
								href="/privacy"
								className="hover:text-text-primary transition-colors"
							>
								Privacy Policy
							</Link>
						</div>
						<div className="text-center md:text-right text-[11px] text-text-muted/80">
							© {new Date().getFullYear()} Demos. Built for
							student leaders &amp; campus organizations.
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
