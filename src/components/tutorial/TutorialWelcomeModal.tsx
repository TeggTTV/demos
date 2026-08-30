'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from './TutorialContext';
import { TOUR_TRACKS_INFO, TourTrack } from './tutorialSteps';
import {
	FiX,
	FiArrowRight,
	FiCheck,
	FiShield,
	FiZap,
	FiPlay,
} from 'react-icons/fi';

export default function TutorialWelcomeModal() {
	const { welcomeModalOpen, closeWelcomeModal, startTour } = useTutorial();

	const [selectedTrack, setSelectedTrack] = useState<TourTrack>('full');

	if (!welcomeModalOpen) return null;

	const handleStart = () => {
		startTour(selectedTrack);
	};

	const handleDismiss = () => {
		closeWelcomeModal();
	};

	const tracks: TourTrack[] = ['full', 'officer', 'student'];

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				{/* Backdrop */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={handleDismiss}
					className="absolute inset-0 bg-slate-950/40"
				/>

				{/* Modal Card */}
				<motion.div
					initial={{ opacity: 0, scale: 0.96, y: 12 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, y: 12 }}
					transition={{ duration: 0.22 }}
					className="relative z-10 w-full max-w-[95vw] sm:max-w-xl rounded-2xl sm:rounded-3xl border border-border/80 bg-surface dark:bg-slate-900 p-4 sm:p-6 md:p-8 shadow-2xl overflow-hidden max-h-[88vh] overflow-y-auto"
				>
					{/* Decorative Glow */}
					<div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-xl" />

					{/* Close Button */}
					<button
						onClick={handleDismiss}
						className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 rounded-full p-2 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
						aria-label="Close welcome modal"
					>
						<FiX size={18} />
					</button>

					{/* Header */}
					<div className="mb-4 sm:mb-5 space-y-1.5 sm:space-y-2 pr-6">
						<div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary/10 border border-primary/20 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-primary">
							<FiZap size={12} />
							<span>Interactive Experience</span>
						</div>
						<h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary leading-tight">
							Welcome to Demos!
						</h2>
						<p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
							Choose a guided walkthrough below to explore the
							platform using realistic mock clubs, live meeting
							check-ins, campus polls, and officer tools.
						</p>
					</div>

					{/* Track Selector - Vertical List Format */}
					<div className="mb-4 sm:mb-5 flex flex-col gap-2 sm:gap-2.5">
						{tracks.map((trackKey) => {
							const info = TOUR_TRACKS_INFO[trackKey];
							const isSelected = selectedTrack === trackKey;

							return (
								<div
									key={trackKey}
									onClick={() => setSelectedTrack(trackKey)}
									className={`relative flex items-center justify-between rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all cursor-pointer border-2 ${
										isSelected
											? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
											: 'border-border/80 bg-surface hover:border-border hover:bg-surface-secondary/50'
									}`}
								>
									<div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 grow">
										<span className="text-xl sm:text-2xl shrink-0 mt-0.5">
											{info.icon}
										</span>
										<div className="min-w-0 grow space-y-0.5 sm:space-y-1">
											<div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
												<h3 className="text-xs sm:text-sm font-bold text-text-primary">
													{info.title}
												</h3>
												<span className="rounded-md bg-surface-secondary px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-text-muted">
													⏱️ {info.estimatedTime}
												</span>
											</div>
											<p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed line-clamp-2">
												{info.description}
											</p>
										</div>
									</div>

									{/* Selection Indicator */}
									<div className="ml-2 sm:ml-3 shrink-0">
										<div
											className={`h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center transition-all ${
												isSelected
													? 'border-primary bg-primary text-white shadow-xs'
													: 'border-border bg-surface'
											}`}
										>
											{isSelected && (
												<FiCheck
													size={11}
													strokeWidth={3}
												/>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Sandbox Notice */}
					<div className="mb-4 sm:mb-5 flex items-center gap-2 sm:gap-2.5 rounded-xl bg-surface-secondary/70 border border-border/60 p-2.5 sm:p-3 text-[11px] sm:text-xs text-text-muted">
						<FiShield className="shrink-0 text-primary" size={15} />
						<span>
							Tutorial mode uses safe client-side mock data. Live
							database records are never modified.
						</span>
					</div>

					{/* Modal Footer Controls */}
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
						<div className="flex items-center">
							{/* <Checkbox
								id="dont-show-tour-again"
								checked={dontShowAgain}
								onChange={(e) =>
									setDontShowAgain(e.target.checked)
								}
								label={
									<span className="text-[11px] sm:text-xs text-text-muted">
										Don&apos;t show this again automatically
									</span>
								}
							/> */}
						</div>

						<div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
							<button
								onClick={handleDismiss}
								className="w-full sm:w-auto rounded-xl sm:rounded-full py-2 sm:py-2.5 px-3 text-xs font-semibold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer text-center"
							>
								Explore on My Own
							</button>
							<button
								onClick={handleStart}
								className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 sm:px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer text-center"
							>
								<FiPlay size={13} />
								<span>Start Guided Tour</span>
								<FiArrowRight size={14} />
							</button>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
