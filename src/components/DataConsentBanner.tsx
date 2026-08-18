'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiX } from 'react-icons/fi';

export default function DataConsentBanner() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Check local storage for existing consent
		const hasConsented = localStorage.getItem('demos-consent-accepted');
		if (!hasConsented) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsVisible(true);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem('demos-consent-accepted', 'true');
		setIsVisible(false);
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ y: 100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 100, opacity: 0 }}
					transition={{ duration: 0.4, ease: 'easeOut' }}
					className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
				>
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface/95 backdrop-blur-md p-5 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
						<div className="flex items-start gap-4">
							<div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
								<FiShield className="h-5 w-5" />
							</div>
							<div className="flex-1 space-y-2">
								<h3 className="font-semibold text-text-primary text-sm">
									We respect your privacy
								</h3>
								<p className="text-xs text-text-secondary leading-relaxed">
									We collect personal user data to enable club
									hub functions and track event attendance. We
									also use third-party analytics to monitor
									usage and improve performance.
								</p>
								<div className="flex items-center gap-3 pt-2">
									<button
										onClick={handleAccept}
										className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
									>
										Accept
									</button>
									<Link
										href="/privacy"
										className="text-xs font-medium text-text-muted hover:text-text-primary underline transition-colors"
									>
										Learn more
									</Link>
								</div>
							</div>
							<button
								onClick={() => setIsVisible(false)}
								className="rounded-lg p-1 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-all"
								aria-label="Close panel"
							>
								<FiX className="h-4 w-4" />
							</button>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
