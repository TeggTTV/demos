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

	if (!isTourActive || !currentStep) return null;

	const trackInfo = TOUR_TRACKS_INFO[currentTrack];
	const isLastStep = currentStepIndex === totalSteps - 1;

	const padding = 16;
	const tooltipWidth = 420;

	// Compute position coordinates for spring-animated floating card
	let computedTop = '50%';
	let computedLeft = '50%';
	let computedTranslate = 'translate(-50%, -50%)';

	if (targetRect) {
		const placement = currentStep.placement || 'bottom';
		const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
		const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

		let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
		if (left < padding) left = padding;
		if (left + tooltipWidth > windowWidth - padding) {
			left = windowWidth - tooltipWidth - padding;
		}

		if (placement === 'bottom') {
			let top = targetRect.bottom + 16;
			if (top + 300 > windowHeight) {
				top = Math.max(padding, targetRect.top - 320);
			}
			computedTop = `${top}px`;
			computedLeft = `${left}px`;
			computedTranslate = 'none';
		} else if (placement === 'top') {
			let top = targetRect.top - 320;
			if (top < padding) {
				top = targetRect.bottom + 16;
			}
			computedTop = `${top}px`;
			computedLeft = `${left}px`;
			computedTranslate = 'none';
		} else if (placement === 'left') {
			let leftPos = targetRect.left - tooltipWidth - 16;
			if (leftPos < padding) leftPos = padding;
			let top = targetRect.top;
			if (top + 300 > windowHeight) top = windowHeight - 320;
			computedTop = `${top}px`;
			computedLeft = `${leftPos}px`;
			computedTranslate = 'none';
		} else if (placement === 'right') {
			let leftPos = targetRect.right + 16;
			if (leftPos + tooltipWidth > windowWidth - padding) {
				leftPos = windowWidth - tooltipWidth - padding;
			}
			let top = targetRect.top;
			if (top + 300 > windowHeight) top = windowHeight - 320;
			computedTop = `${top}px`;
			computedLeft = `${leftPos}px`;
			computedTranslate = 'none';
		}
	}

	return (
		<div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden">
			{/* Subtle, Crisp Dark Backdrop Overlay (Toned down blur) */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="absolute inset-0 bg-slate-950/30 transition-opacity duration-300"
				onClick={nextStep}
			/>

			{/* Spotlight Cutout Border around Target Element */}
			{targetRect && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{
						opacity: 1,
						scale: 1,
						top: targetRect.top - 6,
						left: targetRect.left - 6,
						width: targetRect.width + 12,
						height: targetRect.height + 12,
					}}
					transition={{ type: 'spring', damping: 26, stiffness: 280 }}
					className="fixed z-50 pointer-events-none rounded-2xl ring-4 ring-primary/80 ring-offset-2 ring-offset-transparent shadow-[0_0_35px_rgba(59,130,246,0.35)]"
				/>
			)}

			{/* Smooth Gliding Floating Tooltip Card */}
			<motion.div
				initial={{ opacity: 0, scale: 0.94 }}
				animate={{
					opacity: 1,
					scale: 1,
					top: computedTop,
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
					width: `${tooltipWidth}px`,
					zIndex: 9999,
				}}
				className="rounded-2xl border border-border/90 bg-surface dark:bg-slate-900 p-6 shadow-2xl max-w-[92vw]"
			>
				{/* Header Track and Step Indicator */}
				<div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 mb-4">
					<div className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-base">
							{trackInfo.icon}
						</span>
						<span className="text-xs font-bold uppercase tracking-wider text-primary">
							{trackInfo.title}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
							Step {currentStepIndex + 1} of {totalSteps}
						</span>
						<button
							onClick={skipTour}
							aria-label="Close tour"
							className="rounded-lg p-1 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
						>
							<FiX size={18} />
						</button>
					</div>
				</div>

				{/* Sliding Step Content Container */}
				<AnimatePresence mode="wait">
					<motion.div
						key={currentStep.id}
						initial={{ opacity: 0, x: 14 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -14 }}
						transition={{ duration: 0.2 }}
						className="space-y-4"
					>
						{/* Title & Body */}
						<div className="space-y-2">
							<h3 className="text-lg font-bold text-text-primary tracking-tight">
								{currentStep.title}
							</h3>
							<p className="text-sm text-text-secondary leading-relaxed">
								{currentStep.description}
							</p>
						</div>

						{/* Helpful Tip */}
						{currentStep.tip && (
							<div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 dark:text-amber-200">
								<FiHelpCircle className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" size={15} />
								<span>{currentStep.tip}</span>
							</div>
						)}
					</motion.div>
				</AnimatePresence>

				{/* Progress Dots & Navigation Footer */}
				<div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
					<div className="flex items-center gap-1.5">
						{Array.from({ length: totalSteps }).map((_, idx) => (
							<span
								key={idx}
								className={`h-1.5 rounded-full transition-all duration-300 ${
									idx === currentStepIndex
										? 'w-6 bg-primary'
										: idx < currentStepIndex
											? 'w-1.5 bg-primary/40'
											: 'w-1.5 bg-border'
								}`}
							/>
						))}
					</div>

					<div className="flex items-center gap-2">
						{currentStepIndex > 0 && (
							<button
								onClick={prevStep}
								className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
							>
								<FiArrowLeft size={13} /> Back
							</button>
						)}

						<button
							onClick={nextStep}
							className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
						>
							<span>{isLastStep ? 'Finish Tour' : 'Next'}</span>
							{isLastStep ? <FiCheck size={14} /> : <FiArrowRight size={14} />}
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
