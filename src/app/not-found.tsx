'use client';

import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main className="grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
				{/* Soft background glow */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

				<div className="text-center relative z-10 max-w-md space-y-6">
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{
							type: 'spring',
							stiffness: 300,
							damping: 20,
						}}
						className="text-8xl font-black text-primary tracking-widest selection:bg-transparent"
					>
						404
					</motion.div>

					<div className="space-y-2">
						<h1 className="text-xl font-bold text-text-primary">
							Page Not Found
						</h1>
						<p className="text-xs text-text-muted leading-relaxed">
							Sorry, we couldn’t find the page you’re looking for.
							It might have been moved or doesn’t exist.
						</p>
					</div>

					<motion.div
						initial={{ y: 15, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.15 }}
						className="flex flex-col sm:flex-row gap-3 justify-center"
					>
						<Link
							href="/search"
							className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all text-center"
						>
							Browse Groups
						</Link>
						<Link
							href="/"
							className="rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all text-center"
						>
							Go Back Home
						</Link>
					</motion.div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
