'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiBarChart2,
	FiPlus,
	FiTrash2,
	FiArrowLeft,
	FiX,
	FiCheck,
	FiClock,
	FiLock,
	FiLayers,
	FiUserCheck,
	FiSend,
	FiTarget,
	FiGift,
	FiFileText,
} from 'react-icons/fi';
import { Poll } from '@/types/models';

interface FeedSubAppsPopoverProps {
	isOpen: boolean;
	onClose: () => void;
	onCreatePoll: (pollData: {
		title: string;
		description?: string;
		category?: string;
		options: string[];
		isMultipleChoice?: boolean;
		isAnonymous?: boolean;
		allowUserOptions?: boolean;
		expiresAt?: string;
		pinned?: boolean;
		postToFeed?: boolean;
	}) => Promise<{ success: boolean; poll?: Poll; error?: string }>;
}

type SubAppView = 'menu' | 'create_poll';

const slideVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 60 : -60,
		opacity: 0,
	}),
	center: {
		x: 0,
		opacity: 1,
	},
	exit: (direction: number) => ({
		x: direction < 0 ? 60 : -60,
		opacity: 0,
	}),
};

export default function FeedSubAppsPopover({
	isOpen,
	onClose,
	onCreatePoll,
}: FeedSubAppsPopoverProps) {
	const popoverRef = useRef<HTMLDivElement>(null);
	const [view, setView] = useState<SubAppView>('menu');
	const [direction, setDirection] = useState(1);

	// Poll Creation Form State
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [options, setOptions] = useState<string[]>(['', '']);
	const [isMultipleChoice, setIsMultipleChoice] = useState(false);
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [allowUserOptions, setAllowUserOptions] = useState(false);
	const [hasExpiry, setHasExpiry] = useState(false);
	const [expiryDays, setExpiryDays] = useState('3');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState('');

	// References to option inputs for automatic focusing on Enter
	const optionRefs = useRef<(HTMLInputElement | null)[]>([]);

	// Reset state when opening/closing
	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (isOpen) {
			setView('menu');
			setDirection(1);
			setTitle('');
			setDescription('');
			setOptions(['', '']);
			setIsMultipleChoice(false);
			setIsAnonymous(false);
			setAllowUserOptions(false);
			setHasExpiry(false);
			setExpiryDays('3');
			setFormError('');
		}
	}, [isOpen]);
	/* eslint-enable react-hooks/set-state-in-effect */

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Option handlers
	const handleAddOption = () => {
		setOptions((prev) => [...prev, '']);
		setTimeout(() => {
			const nextIdx = options.length;
			optionRefs.current[nextIdx]?.focus();
		}, 50);
	};

	const handleRemoveOption = (index: number) => {
		if (options.length <= 2) return;
		setOptions((prev) => prev.filter((_, i) => i !== index));
	};

	const handleOptionChange = (index: number, val: string) => {
		setOptions((prev) => {
			const updated = [...prev];
			updated[index] = val;
			return updated;
		});
	};

	const handleOptionKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			e.stopPropagation();
			if (index === options.length - 1) {
				handleAddOption();
			} else {
				optionRefs.current[index + 1]?.focus();
			}
		}
	};

	// Submit poll
	const handleSubmitPoll = async (e?: React.SyntheticEvent) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		setFormError('');

		if (!title.trim()) {
			setFormError('Please enter a question or title for your poll.');
			return;
		}

		const cleanOptions = options.filter((o) => o.trim().length > 0);
		if (cleanOptions.length < 2) {
			setFormError('Please provide at least 2 non-empty poll options.');
			return;
		}

		setIsSubmitting(true);
		try {
			let expiresAt: string | undefined = undefined;
			if (hasExpiry) {
				const days = parseInt(expiryDays, 10) || 3;
				const expDate = new Date();
				expDate.setDate(expDate.getDate() + days);
				expiresAt = expDate.toISOString();
			}

			const res = await onCreatePoll({
				title: title.trim(),
				description: description.trim() || undefined,
				options: cleanOptions,
				isMultipleChoice,
				isAnonymous,
				allowUserOptions,
				expiresAt,
				pinned: false,
				postToFeed: true,
			});

			if (res.success) {
				onClose();
			} else {
				setFormError(res.error || 'Failed to create poll');
			}
		} catch {
			setFormError('Network error while creating poll.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const goToCreatePoll = () => {
		setDirection(1);
		setView('create_poll');
	};

	const goToMenu = () => {
		setDirection(-1);
		setView('menu');
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					ref={popoverRef}
					initial={{ opacity: 0, scale: 0.95, y: 12 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 12 }}
					transition={{ duration: 0.18, ease: 'easeOut' }}
					className="absolute bottom-full mb-3 left-0 sm:left-2 z-50 w-[92vw] sm:w-[420px] max-w-[440px] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md flex flex-col max-h-[85vh]"
				>
					<AnimatePresence mode="wait" custom={direction} initial={false}>
						{/* Sub-Apps Menu View */}
						{view === 'menu' ? (
							<motion.div
								key="menu"
								custom={direction}
								variants={slideVariants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.2, ease: 'easeInOut' }}
								className="p-4 space-y-3"
							>
								<div className="flex items-center justify-between border-b border-border pb-2.5">
									<div className="flex items-center gap-2">
										<div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
											<FiPlus size={14} />
										</div>
										<div>
											<h4 className="text-xs font-bold text-text-primary">
												Club Feed Sub-Apps
											</h4>
											<p className="text-[10px] text-text-muted">
												Interactive tools for leaders &amp; officers
											</p>
										</div>
									</div>
									<button
										type="button"
										onClick={onClose}
										className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-secondary cursor-pointer"
									>
										<FiX size={14} />
									</button>
								</div>

								{/* Active Available Sub-Apps */}
								<div className="space-y-2">
									{/* Polls Sub-App Button */}
									<motion.button
										type="button"
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
										onClick={goToCreatePoll}
										className="w-full flex items-center gap-3.5 p-3 rounded-xl bg-surface-secondary/70 hover:bg-primary-light border border-border hover:border-primary/40 transition-all text-left group cursor-pointer"
									>
										<div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
											<FiBarChart2 size={18} />
										</div>
										<div className="grow min-w-0">
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-text-primary group-hover:text-primary">
													Create Poll
												</span>
												<span className="text-[9px] font-extrabold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
													Active Sub-App
												</span>
											</div>
											<p className="text-[11px] text-text-muted truncate mt-0.5">
												Launch real-time polls, surveys, &amp; member voting
											</p>
										</div>
										<span className="text-xs text-text-muted group-hover:text-primary font-bold">
											→
										</span>
									</motion.button>

									{/* Extensible Future Sub-App Slots */}
									<div className="grid grid-cols-3 gap-2 pt-1">
										<div className="p-2.5 rounded-xl border border-border/50 bg-surface-secondary/30 text-center opacity-60">
											<div className="mx-auto h-7 w-7 rounded-lg bg-surface-tertiary flex items-center justify-center text-text-muted mb-1">
												<FiTarget size={14} />
											</div>
											<span className="text-[10px] font-semibold text-text-primary block truncate">
												Quick Quiz
											</span>
											<span className="text-[8px] text-text-muted block">Soon</span>
										</div>

										<div className="p-2.5 rounded-xl border border-border/50 bg-surface-secondary/30 text-center opacity-60">
											<div className="mx-auto h-7 w-7 rounded-lg bg-surface-tertiary flex items-center justify-center text-text-muted mb-1">
												<FiGift size={14} />
											</div>
											<span className="text-[10px] font-semibold text-text-primary block truncate">
												Raffle &amp; Draw
											</span>
											<span className="text-[8px] text-text-muted block">Soon</span>
										</div>

										<div className="p-2.5 rounded-xl border border-border/50 bg-surface-secondary/30 text-center opacity-60">
											<div className="mx-auto h-7 w-7 rounded-lg bg-surface-tertiary flex items-center justify-center text-text-muted mb-1">
												<FiFileText size={14} />
											</div>
											<span className="text-[10px] font-semibold text-text-primary block truncate">
												Sign-Up List
											</span>
											<span className="text-[8px] text-text-muted block">Soon</span>
										</div>
									</div>
								</div>
							</motion.div>
						) : (
							/* Create Poll Sub-Page View (Slide in from right) */
							<motion.div
								key="create_poll"
								custom={direction}
								variants={slideVariants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.2, ease: 'easeInOut' }}
								className="flex flex-col max-h-[80vh] overflow-hidden"
							>
								{/* Header with back button */}
								<div className="px-4 py-3 border-b border-border bg-surface-secondary/50 flex items-center justify-between shrink-0">
									<button
										type="button"
										onClick={goToMenu}
										className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary cursor-pointer transition-colors"
									>
										<FiArrowLeft size={13} />
										<span>Back to Sub-Apps</span>
									</button>
									<div className="flex items-center gap-1.5">
										<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
										<span className="text-[11px] font-bold text-text-primary">
											New Poll
										</span>
									</div>
									<button
										type="button"
										onClick={onClose}
										className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-secondary cursor-pointer"
									>
										<FiX size={14} />
									</button>
								</div>

								{/* Scrollable Form Body */}
								<div className="p-4 space-y-3.5 overflow-y-auto grow">
									{formError && (
										<div className="p-2.5 rounded-xl bg-danger-bg border border-danger/20 text-danger text-[11px] font-medium flex items-center gap-2">
											<span>⚠️</span>
											<span>{formError}</span>
										</div>
									)}

									{/* Question / Title Input */}
									<div className="space-y-1">
										<label className="block text-[11px] font-bold text-text-primary">
											Poll Question / Title <span className="text-danger">*</span>
										</label>
										<input
											type="text"
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													optionRefs.current[0]?.focus();
												}
											}}
											placeholder="What should we vote on?"
											className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
											autoFocus
										/>
									</div>

									{/* Description (Optional) */}
									<div className="space-y-1">
										<label className="block text-[10px] font-medium text-text-muted">
											Context / Instructions (Optional)
										</label>
										<textarea
											rows={2}
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Add details, links, or context for voters..."
											className="w-full rounded-xl border border-border bg-surface-secondary p-2.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
										/>
									</div>

									{/* Poll Items List */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<label className="block text-[11px] font-bold text-text-primary">
												Poll Options <span className="text-danger">*</span>
											</label>
											<span className="text-[10px] text-text-muted">
												Press Enter to add next
											</span>
										</div>

										<div className="space-y-2">
											{options.map((opt, index) => (
												<div
													key={index}
													className="flex items-center gap-2"
												>
													<span className="h-5 w-5 rounded-full bg-surface-secondary border border-border text-[10px] font-bold text-text-muted flex items-center justify-center shrink-0">
														{index + 1}
													</span>
													<input
														ref={(el) => {
															optionRefs.current[index] = el;
														}}
														type="text"
														value={opt}
														onChange={(e) =>
															handleOptionChange(index, e.target.value)
														}
														onKeyDown={(e) =>
															handleOptionKeyDown(index, e)
														}
														placeholder={`Option ${index + 1}...`}
														className="grow rounded-xl border border-border bg-surface-secondary px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
													/>
													{options.length > 2 && (
														<button
															type="button"
															onClick={() => handleRemoveOption(index)}
															className="text-text-muted hover:text-danger p-1 cursor-pointer transition-colors"
															title="Remove Option"
														>
															<FiTrash2 size={13} />
														</button>
													)}
												</div>
											))}
										</div>

										<button
											type="button"
											onClick={handleAddOption}
											className="w-full mt-1.5 py-1.5 rounded-xl border border-dashed border-border hover:border-primary/50 text-text-muted hover:text-primary text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-surface-secondary/30"
										>
											<FiPlus size={13} /> Add item
										</button>
									</div>

									{/* Custom Styled Checkboxes for Voting Rules */}
									<div className="pt-2 border-t border-border/60 space-y-2.5">
										<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
											Voting Rules
										</span>

										{/* Multiple Choice */}
										<button
											type="button"
											onClick={() => setIsMultipleChoice(!isMultipleChoice)}
											className="flex items-center justify-between cursor-pointer group w-full text-left py-0.5"
										>
											<div className="flex items-center gap-2">
												<FiLayers className="text-text-muted group-hover:text-primary transition-colors" size={13} />
												<div>
													<span className="font-semibold text-text-primary block text-[11px]">
														Multiple Choice
													</span>
													<span className="text-[9px] text-text-muted block">
														Allow members to select more than one option
													</span>
												</div>
											</div>
											<div
												className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
													isMultipleChoice
														? 'border-primary bg-primary text-white shadow-2xs'
														: 'border-border bg-surface-secondary group-hover:border-primary/40'
												}`}
											>
												<AnimatePresence initial={false}>
													{isMultipleChoice && (
														<motion.div
															initial={{ scale: 0, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															exit={{ scale: 0, opacity: 0 }}
															transition={{ duration: 0.15 }}
														>
															<FiCheck size={11} className="stroke-[3]" />
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										</button>

										{/* Anonymous Balloting */}
										<button
											type="button"
											onClick={() => setIsAnonymous(!isAnonymous)}
											className="flex items-center justify-between cursor-pointer group w-full text-left py-0.5"
										>
											<div className="flex items-center gap-2">
												<FiLock className="text-text-muted group-hover:text-primary transition-colors" size={13} />
												<div>
													<span className="font-semibold text-text-primary block text-[11px]">
														Anonymous Voting
													</span>
													<span className="text-[9px] text-text-muted block">
														Hide voter identities from results
													</span>
												</div>
											</div>
											<div
												className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
													isAnonymous
														? 'border-primary bg-primary text-white shadow-2xs'
														: 'border-border bg-surface-secondary group-hover:border-primary/40'
												}`}
											>
												<AnimatePresence initial={false}>
													{isAnonymous && (
														<motion.div
															initial={{ scale: 0, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															exit={{ scale: 0, opacity: 0 }}
															transition={{ duration: 0.15 }}
														>
															<FiCheck size={11} className="stroke-[3]" />
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										</button>

										{/* Member-added options */}
										<button
											type="button"
											onClick={() => setAllowUserOptions(!allowUserOptions)}
											className="flex items-center justify-between cursor-pointer group w-full text-left py-0.5"
										>
											<div className="flex items-center gap-2">
												<FiUserCheck className="text-text-muted group-hover:text-primary transition-colors" size={13} />
												<div>
													<span className="font-semibold text-text-primary block text-[11px]">
														Allow Member Options
													</span>
													<span className="text-[9px] text-text-muted block">
														Club members can add their own choices
													</span>
												</div>
											</div>
											<div
												className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
													allowUserOptions
														? 'border-primary bg-primary text-white shadow-2xs'
														: 'border-border bg-surface-secondary group-hover:border-primary/40'
												}`}
											>
												<AnimatePresence initial={false}>
													{allowUserOptions && (
														<motion.div
															initial={{ scale: 0, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															exit={{ scale: 0, opacity: 0 }}
															transition={{ duration: 0.15 }}
														>
															<FiCheck size={11} className="stroke-[3]" />
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										</button>

										{/* Expiry / Deadline */}
										<div className="space-y-1.5">
											<button
												type="button"
												onClick={() => setHasExpiry(!hasExpiry)}
												className="flex items-center justify-between cursor-pointer group w-full text-left py-0.5"
											>
												<div className="flex items-center gap-2">
													<FiClock className="text-text-muted group-hover:text-primary transition-colors" size={13} />
													<div>
														<span className="font-semibold text-text-primary block text-[11px]">
															Auto-Close Deadline
														</span>
														<span className="text-[9px] text-text-muted block">
															Automatically close voting after duration
														</span>
													</div>
												</div>
												<div
													className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
														hasExpiry
															? 'border-primary bg-primary text-white shadow-2xs'
															: 'border-border bg-surface-secondary group-hover:border-primary/40'
													}`}
												>
													<AnimatePresence initial={false}>
														{hasExpiry && (
															<motion.div
																initial={{ scale: 0, opacity: 0 }}
																animate={{ scale: 1, opacity: 1 }}
																exit={{ scale: 0, opacity: 0 }}
																transition={{ duration: 0.15 }}
															>
																<FiCheck size={11} className="stroke-[3]" />
															</motion.div>
														)}
													</AnimatePresence>
												</div>
											</button>

											{hasExpiry && (
												<div className="pl-6 pt-1 flex items-center gap-2">
													<span className="text-[10px] text-text-muted">Close in:</span>
													<select
														value={expiryDays}
														onChange={(e) => setExpiryDays(e.target.value)}
														className="rounded-lg border border-border bg-surface-secondary px-2 py-1 text-[11px] text-text-primary focus:outline-none"
													>
														<option value="1">24 Hours (1 Day)</option>
														<option value="3">3 Days</option>
														<option value="7">1 Week (7 Days)</option>
														<option value="14">2 Weeks</option>
													</select>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Footer Submit Button */}
								<div className="p-3 border-t border-border bg-surface-secondary/40 flex items-center justify-between shrink-0">
									<button
										type="button"
										onClick={goToMenu}
										className="px-3 py-1.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
									>
										Cancel
									</button>

									<button
										type="button"
										onClick={handleSubmitPoll}
										disabled={isSubmitting}
										className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
									>
										{isSubmitting ? (
											<>
												<span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
												<span>Creating...</span>
											</>
										) : (
											<>
												<FiSend size={12} />
												<span>Create &amp; Post to Feed</span>
											</>
										)}
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
