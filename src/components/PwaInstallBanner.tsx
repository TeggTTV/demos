'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiShare, FiDownload, FiInfo } from 'react-icons/fi';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

export default function PwaInstallBanner() {
	const [isVisible, setIsVisible] = useState(false);
	const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>(
		'other',
	);
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		// 1. Check if already running in standalone mode (installed)
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone === true;

		if (isStandalone) return;

		// 2. Check if user previously dismissed the prompt
		const isDismissed =
			localStorage.getItem('demos_pwa_dismissed') === 'true';
		if (isDismissed) return;

		// 3. Detect Platform
		const ua = window.navigator.userAgent.toLowerCase();
		const isIos = /iphone|ipad|ipod/.test(ua);
		const isAndroid = /android/.test(ua);
		const isMobile =
			isIos || isAndroid || /mobi|tablet|opera mini|apidogo/.test(ua);

		// Only show banner to mobile users
		if (!isMobile) return;

		setPlatform(isIos ? 'ios' : isAndroid ? 'android' : 'other');

		// 4. Delay banner showing for a cleaner onboarding experience (2 seconds)
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 2000);

		// 5. Listen for browser's beforeinstallprompt (mostly Android/Chrome)
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setIsVisible(true);
		};

		window.addEventListener(
			'beforeinstallprompt',
			handleBeforeInstallPrompt,
		);

		return () => {
			clearTimeout(timer);
			window.removeEventListener(
				'beforeinstallprompt',
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	const handleDismiss = () => {
		setIsVisible(false);
		localStorage.setItem('demos_pwa_dismissed', 'true');
	};

	const handleInstall = async () => {
		if (!deferredPrompt) return;

		// Trigger native install prompt
		deferredPrompt.prompt();

		// Wait for user choices
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			setIsVisible(false);
		}
		setDeferredPrompt(null);
	};

	if (!isVisible) return null;

	return (
		<AnimatePresence>
			<div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:max-w-sm md:right-4">
				<motion.div
					initial={{ opacity: 0, y: 50, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.95 }}
					className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-2xl backdrop-blur-md space-y-3"
				>
					<button
						onClick={handleDismiss}
						className="absolute top-3 right-3 text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-secondary/50 transition-colors"
						aria-label="Close panel"
					>
						<FiX size={16} />
					</button>

					<div className="flex items-center gap-3">
						<div className="relative h-11 w-11 overflow-hidden rounded-xl border border-border bg-background shrink-0 shadow-xs">
							<Image
								src="/icon1.png"
								alt="Demos App Icon"
								fill
								className="object-cover dark:invert"
								unoptimized
							/>
						</div>
						<div className="min-w-0 pr-6">
							<h4 className="text-xs font-bold text-text-primary">
								Install Demos App
							</h4>
							<p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
								Add to your home screen for instant meeting
								check-ins and reliable push notifications.
							</p>
						</div>
					</div>

					<div className="pt-1 flex items-center justify-between gap-3">
						{true ? (
							<button
								onClick={handleInstall}
								className="grow inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[11px] font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
							>
								<FiDownload size={13} />
								<span>Install Now</span>
							</button>
						) : platform === 'ios' ? (
							<div className="grow rounded-xl bg-primary-light/50 border border-primary/20 px-3 py-2 text-[10px] text-primary flex items-start gap-2 font-medium">
								<FiInfo
									size={14}
									className="shrink-0 mt-0.5 text-primary"
								/>
								<span>
									Tap the share icon{' '}
									<FiShare className="inline mx-0.5 mb-0.5" />{' '}
									and select{' '}
									<strong>
										&quot;Add to Home Screen&quot;
									</strong>
									.
								</span>
							</div>
						) : (
							<div className="grow rounded-xl bg-surface-secondary border border-border px-3 py-2 text-[10px] text-text-secondary flex items-start gap-2">
								<FiInfo
									size={14}
									className="shrink-0 mt-0.5 text-text-muted"
								/>
								<span>
									Open your browser menu (Chrome / Safari) and
									tap{' '}
									<strong>
										&quot;Add to Home Screen&quot;
									</strong>
									.
								</span>
							</div>
						)}

						{platform === 'android' && deferredPrompt && (
							<button
								onClick={handleDismiss}
								className="rounded-xl border border-border px-3 py-2 text-[11px] font-semibold text-text-secondary hover:bg-surface-secondary/50 cursor-pointer"
							>
								Later
							</button>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
