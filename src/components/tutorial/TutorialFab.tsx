'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from './TutorialContext';
import { useAppContext } from '@/components/AppContext';
import {
	FiZap,
	FiRefreshCw,
	FiX,
	FiChevronUp,
	FiCheckCircle,
	FiLogOut,
} from 'react-icons/fi';

export default function TutorialFab() {
	const {
		isTourActive,
		startTour,
		openWelcomeModal,
		triggerSimulation,
		switchPersona,
		resetSandbox,
	} = useTutorial();

	const { currentUser, isTutorialMode, exitTutorialMode } = useAppContext();
	const [isOpen, setIsOpen] = useState(false);
	const [actionFeedback, setActionFeedback] = useState<string | null>(null);

	const handleSimulate = (simId: string, label: string) => {
		triggerSimulation(simId);
		setActionFeedback(`Triggered: ${label}`);
		setTimeout(() => setActionFeedback(null), 2500);
	};

	const handleReset = () => {
		resetSandbox();
		setActionFeedback('Demo data reset to default.');
		setTimeout(() => setActionFeedback(null), 2500);
	};

	const personas = [
		{ id: 'user_alex_chen', name: 'Alex Chen', role: 'President (ACM)', icon: '👑' },
		{ id: 'user_maya_lin', name: 'Maya Lin', role: 'Design Lead', icon: '🎨' },
		{ id: 'user_jordan_miller', name: 'Jordan Miller', role: 'Robotics Lead', icon: '🤖' },
		{ id: 'user_marcus_w', name: 'Marcus Washington', role: 'Applicant', icon: '🎓' },
	];

	return (
		<div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end max-w-[calc(100vw-32px)]">
			{/* Toast Feedback Notification */}
			<AnimatePresence>
				{actionFeedback && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 5, scale: 0.95 }}
						className="mb-2 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-semibold shadow-xl border border-white/10 max-w-[calc(100vw-32px)]"
					>
						<FiCheckCircle className="text-emerald-400" size={14} />
						<span className="truncate">{actionFeedback}</span>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Expandable Mini HUD Drawer */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ duration: 0.2 }}
						className="mb-3 w-[calc(100vw-32px)] sm:w-96 max-w-sm rounded-2xl border border-border/80 bg-surface/95 dark:bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl max-h-[78vh] overflow-y-auto"
					>
						{/* HUD Header */}
						<div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
							<div className="flex items-center gap-2">
								<span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs">
									✨
								</span>
								<h4 className="text-sm font-bold text-text-primary">
									Interactive Tour & Sandbox
								</h4>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="rounded-lg p-1 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
								aria-label="Close tour menu"
							>
								<FiX size={16} />
							</button>
						</div>

						{/* Quick Mode Status Badge */}
						<div className="mb-3 flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary font-medium">
							<span>
								{isTutorialMode ? '🧪 Sandbox Mode: Mock Data Active' : '🟢 Standard Mode'}
							</span>
							{isTutorialMode && (
								<button
									onClick={() => {
										exitTutorialMode();
										setIsOpen(false);
									}}
									className="flex items-center gap-1 font-bold underline hover:text-primary-hover cursor-pointer"
								>
									<FiLogOut size={12} /> Exit
								</button>
							)}
						</div>

						{/* Guided Tour Tracks */}
						<div className="mb-4 space-y-1.5">
							<label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
								Guided Walkthroughs
							</label>
							<div className="grid grid-cols-2 gap-1.5">
								<button
									onClick={() => {
										startTour('full');
										setIsOpen(false);
									}}
									className="flex items-center gap-1.5 rounded-xl border border-border p-2 text-left text-xs font-semibold text-text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
								>
									<span>🌟</span> Full Tour
								</button>
								<button
									onClick={() => {
										startTour('officer');
										setIsOpen(false);
									}}
									className="flex items-center gap-1.5 rounded-xl border border-border p-2 text-left text-xs font-semibold text-text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
								>
									<span>👑</span> Officer Hub
								</button>
								<button
									onClick={() => {
										startTour('student');
										setIsOpen(false);
									}}
									className="flex items-center gap-1.5 rounded-xl border border-border p-2 text-left text-xs font-semibold text-text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
								>
									<span>🎓</span> Student Track
								</button>
								<button
									onClick={() => {
										openWelcomeModal();
										setIsOpen(false);
									}}
									className="flex items-center gap-1.5 rounded-xl border border-border p-2 text-left text-xs font-semibold text-text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
								>
									<span>📖</span> Tour Menu
								</button>
							</div>
						</div>

						{/* Persona Switcher */}
						<div className="mb-4 space-y-1.5">
							<div className="flex items-center justify-between">
								<label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
									Switch Active Persona
								</label>
								<span className="text-[10px] text-text-muted">
									Active: {currentUser?.name?.split(' ')[0] || 'Guest'}
								</span>
							</div>
							<div className="grid grid-cols-2 gap-1.5">
								{personas.map((p) => {
									const active = currentUser?.id === p.id;
									return (
										<button
											key={p.id}
											onClick={() => {
												switchPersona(p.id);
												setActionFeedback(`Switched persona to ${p.name}`);
											}}
											className={`flex items-center gap-2 rounded-xl p-2 text-left text-xs transition-all cursor-pointer ${
												active
													? 'border-2 border-primary bg-primary/10 font-bold text-primary'
													: 'border border-border text-text-secondary hover:bg-surface-secondary'
											}`}
										>
											<span className="text-sm">{p.icon}</span>
											<div className="truncate">
												<p className="truncate font-semibold">{p.name}</p>
												<p className="text-[10px] opacity-75">{p.role}</p>
											</div>
										</button>
									);
								})}
							</div>
						</div>

						{/* Live Simulation Triggers */}
						<div className="mb-3 space-y-1.5">
							<label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
								Trigger Real-Time Events
							</label>
							<div className="grid grid-cols-2 gap-1.5">
								<button
									onClick={() => handleSimulate('simulate_checkin', 'Live Check-in')}
									className="flex items-center gap-1.5 rounded-xl bg-surface-secondary px-2.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary/80 transition-colors cursor-pointer"
								>
									<FiZap className="text-amber-500" size={13} />
									<span>Check-in</span>
								</button>
								<button
									onClick={() => handleSimulate('simulate_vote', 'Poll Vote')}
									className="flex items-center gap-1.5 rounded-xl bg-surface-secondary px-2.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary/80 transition-colors cursor-pointer"
								>
									<span className="text-xs">🗳️</span>
									<span>Poll Vote</span>
								</button>
								<button
									onClick={() => handleSimulate('simulate_join', 'Join Request')}
									className="flex items-center gap-1.5 rounded-xl bg-surface-secondary px-2.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary/80 transition-colors cursor-pointer"
								>
									<span className="text-xs">📥</span>
									<span>Applicant</span>
								</button>
								<button
									onClick={() => handleSimulate('simulate_notification', 'Campus Alert')}
									className="flex items-center gap-1.5 rounded-xl bg-surface-secondary px-2.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary/80 transition-colors cursor-pointer"
								>
									<span className="text-xs">🔔</span>
									<span>Campus Alert</span>
								</button>
							</div>
						</div>

						{/* Footer Actions */}
						<div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
							<button
								onClick={handleReset}
								className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
							>
								<FiRefreshCw size={12} /> Reset Data
							</button>
							<span className="text-[10px] text-text-muted">Zero DB changes</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating Trigger Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Toggle Tutorial and Simulation Controller"
				className="group flex items-center gap-2 rounded-full bg-linear-to-r from-primary to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
			>
				<span className="relative flex h-2.5 w-2.5">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
				</span>
				<span>{isTourActive ? 'Tour Active' : 'Tour & Sandbox'}</span>
				<FiChevronUp
					className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
					size={16}
				/>
			</button>
		</div>
	);
}
