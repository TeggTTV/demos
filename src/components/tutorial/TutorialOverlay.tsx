'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from './TutorialContext';
import { TOUR_TRACKS_INFO } from './tutorialSteps';
import {
	FiArrowRight,
	FiArrowLeft,
	FiCheck,
	FiX,
	FiHelpCircle,
} from 'react-icons/fi';

export default function TutorialOverlay() {
	const {
		isTourActive,
		currentStep,
		currentStepIndex,
		totalSteps,
		currentTrack,
		targetRect,
		nextStep,
		prevStep,
		skipTour,
	} = useTutorial();

	const [windowSize, setWindowSize] = React.useState({
		width: typeof window !== 'undefined' ? window.innerWidth : 1200,
		height: typeof window !== 'undefined' ? window.innerHeight : 800,
	});

	React.useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('orientationchange', handleResize);
		};
	}, []);

	if (!isTourActive || !currentStep) return null;

	const trackInfo = TOUR_TRACKS_INFO[currentTrack];
	const isLastStep = currentStepIndex === totalSteps - 1;

	const isMobile = windowSize.width < 640;
	const cardWidth = isMobile
		? Math.min(windowSize.width - 24, 380)
		: Math.min(windowSize.width - 32, 420);
	const padding = 12;

	// Compute position coordinates for floating card
	let computedTop: string | number = '50%';
	let computedBottom: string | number | undefined = undefined;
	let computedLeft: string | number = '50%';
	let computedTranslate = 'translate(-50%, -50%)';

	if (!targetRect) {
		computedTop = '50%';
		computedLeft = '50%';
		computedTranslate = 'translate(-50%, -50%)';
	} else if (isMobile) {
		// On mobile screens, always center horizontally and smartly position above or below
		computedLeft = '50%';
		computedTranslate = 'translateX(-50%)';

		const targetCenterY = targetRect.top + targetRect.height / 2;
		const isTargetInUpperHalf = targetCenterY <= windowSize.height * 0.52;

		if (isTargetInUpperHalf) {
			// Place below target if space allows, otherwise clamp to bottom safe area
			const spaceBelow = windowSize.height - targetRect.bottom;
			if (spaceBelow >= 240) {
				computedTop = `${Math.min(targetRect.bottom + 10, windowSize.height - 270)}px`;
				computedBottom = undefined;
			} else {
				computedTop = 'auto';
				computedBottom = '16px';
			}
		} else {
			// Place above target if space allows, otherwise clamp to top safe area
			const spaceAbove = targetRect.top;
			if (spaceAbove >= 240) {
				computedTop = `${Math.max(12, targetRect.top - 260)}px`;
				computedBottom = undefined;
			} else {
				computedTop = '16px';
				computedBottom = 'auto';
			}
		}
	} else {
		// Desktop / Tablet positioning with strict viewport boundaries
		const placement = currentStep.placement || 'bottom';
		let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
		if (left < padding) left = padding;
		if (left + cardWidth > windowSize.width - padding) {
			left = windowSize.width - cardWidth - padding;
		}

		if (placement === 'bottom') {
			let top = targetRect.bottom + 14;
			if (top + 280 > windowSize.height) {
				top = Math.max(padding, targetRect.top - 290);
			}
			computedTop = `${top}px`;
			computedLeft = `${left}px`;
			computedTranslate = 'none';
		} else if (placement === 'top') {
			let top = targetRect.top - 290;
			if (top < padding) {
				top = targetRect.bottom + 14;
			}
			computedTop = `${top}px`;
			computedLeft = `${left}px`;
			computedTranslate = 'none';
		} else if (placement === 'left') {
			let leftPos = targetRect.left - cardWidth - 14;
			if (leftPos < padding) leftPos = padding;
			const top = Math.max(
				padding,
				Math.min(targetRect.top, windowSize.height - 290),
			);
			computedTop = `${top}px`;
			computedLeft = `${leftPos}px`;
			computedTranslate = 'none';
		} else if (placement === 'right') {
			let leftPos = targetRect.right + 14;
			if (leftPos + cardWidth > windowSize.width - padding) {
				leftPos = windowSize.width - cardWidth - padding;
			}
			const top = Math.max(
				padding,
				Math.min(targetRect.top, windowSize.height - 290),
			);
			computedTop = `${top}px`;
			computedLeft = `${leftPos}px`;
			computedTranslate = 'none';
		}
	}

	return (
		<div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden">
			{/* Subtle, Crisp Dark Backdrop Overlay */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="absolute inset-0 bg-slate-950/35 transition-opacity duration-300"
				onClick={nextStep}
			/>

			{/* Spotlight Cutout Border around Target Element */}
			{targetRect && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{
						opacity: 1,
						scale: 1,
						top: Math.max(0, targetRect.top - 4),
						left: Math.max(0, targetRect.left - 4),
						width: Math.min(windowSize.width, targetRect.width + 8),
						height: targetRect.height + 8,
					}}
					transition={{ type: 'spring', damping: 26, stiffness: 280 }}
					className="fixed z-50 pointer-events-none rounded-xl ring-4 ring-primary/80 ring-offset-2 ring-offset-transparent shadow-[0_0_35px_rgba(59,130,246,0.35)]"
				/>
			)}

			{/* Smooth Gliding Floating Tooltip Card */}
			<motion.div
				initial={{ opacity: 0, scale: 0.94 }}
				animate={{
					opacity: 1,
					scale: 1,
					top: computedTop,
					bottom: computedBottom,
					left: computedLeft,
					transform: computedTranslate,
				}}
				transition={{
					type: 'spring',
					damping: 28,
					stiffness: 240,
					mass: 0.75,
				}}
				style={{
					position: 'fixed',
					width: `${cardWidth}px`,
					maxWidth: 'calc(100vw - 24px)',
					zIndex: 9999,
				}}
				className="rounded-2xl border border-border/90 bg-surface dark:bg-slate-900 p-4 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
			>
				{/* Header Track and Step Indicator */}
				<div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5 mb-3 sm:mb-4">
					<div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
						<span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm sm:text-base">
							{trackInfo.icon}
						</span>
						<span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary truncate">
							{trackInfo.title}
						</span>
					</div>
					<div className="flex items-center gap-1.5 shrink-0">
						<span className="rounded-full bg-surface-secondary px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-text-secondary">
							{currentStepIndex + 1}/{totalSteps}
						</span>
						<button
							onClick={skipTour}
							aria-label="Close tour"
							className="rounded-lg p-1 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
						>
							<FiX size={16} />
						</button>
					</div>
				</div>

				{/* Sliding Step Content Container */}
				<AnimatePresence mode="wait">
					<motion.div
						key={currentStep.id}
						initial={{ opacity: 0, x: 12 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -12 }}
						transition={{ duration: 0.18 }}
						className="space-y-3 sm:space-y-4"
					>
						{/* Title & Body */}
						<div className="space-y-1.5 sm:space-y-2">
							<h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight leading-snug">
								{currentStep.title}
							</h3>
							<p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
								{currentStep.description}
							</p>
						</div>

						{/* Helpful Tip */}
						{currentStep.tip && (
							<div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 sm:p-3 text-[11px] sm:text-xs text-amber-900 dark:text-amber-200">
								<FiHelpCircle
									className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
									size={14}
								/>
								<span className="leading-relaxed">
									{currentStep.tip}
								</span>
							</div>
						)}
					</motion.div>
				</AnimatePresence>

				{/* Progress Dots & Navigation Footer */}
				<div className="flex items-center justify-between pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border/60">
					<div className="flex items-center gap-1 sm:gap-1.5">
						{Array.from({ length: totalSteps }).map((_, idx) => (
							<span
								key={idx}
								className={`h-1.5 rounded-full transition-all duration-300 ${
									idx === currentStepIndex
										? 'w-5 sm:w-6 bg-primary'
										: idx < currentStepIndex
											? 'w-1.5 bg-primary/40'
											: 'w-1.5 bg-border'
								}`}
							/>
						))}
					</div>

					<div className="flex items-center gap-1.5 sm:gap-2">
						{currentStepIndex > 0 && (
							<button
								onClick={prevStep}
								className="flex items-center gap-1 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
							>
								<FiArrowLeft size={13} /> Back
							</button>
						)}

						<button
							onClick={nextStep}
							className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-primary px-3.5 sm:px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
						>
							<span>{isLastStep ? 'Finish' : 'Next'}</span>
							{isLastStep ? (
								<FiCheck size={14} />
							) : (
								<FiArrowRight size={14} />
							)}
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
