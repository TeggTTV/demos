'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiX,
	FiPlus,
	FiTrash2,
	FiSend,
	FiLayers,
	FiLock,
	FiUserCheck,
	FiClock,
	FiBarChart2,
	FiCheck,
} from 'react-icons/fi';
import { Poll } from '@/types/models';

interface CreatePollModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (pollData: {
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

const CATEGORIES = [
	'General',
	'Meeting Scheduling',
	'Event Planning',
	'Club Decisions',
	'Feedback & Fun',
];

const TEMPLATES = [
	{
		name: 'Meeting Times',
		title: 'Best time for our next general meeting?',
		category: 'Meeting Scheduling',
		options: ['Wednesday 6:00 PM', 'Thursday 5:30 PM', 'Friday 4:00 PM'],
	},
	{
		name: 'Yes / No / Abstain',
		title: 'Vote on amendment proposal',
		category: 'Club Decisions',
		options: ['In Favor (Yes)', 'Opposed (No)', 'Abstain'],
	},
	{
		name: 'Event Catering',
		title: 'Food preference for upcoming social?',
		category: 'Event Planning',
		options: ['Pizza & Soda', 'Taco Bar', 'Boba & Pastries', 'Mediterranean Bowls'],
	},
];

export default function CreatePollModal({
	isOpen,
	onClose,
	onSubmit,
}: CreatePollModalProps) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState('General');
	const [options, setOptions] = useState<string[]>(['', '']);
	const [isMultipleChoice, setIsMultipleChoice] = useState(false);
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [allowUserOptions, setAllowUserOptions] = useState(false);
	const [hasExpiry, setHasExpiry] = useState(false);
	const [expiryDays, setExpiryDays] = useState('3');
	const [postToFeed, setPostToFeed] = useState(true);
	const [pinned, setPinned] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState('');

	const optionRefs = useRef<(HTMLInputElement | null)[]>([]);

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (isOpen) {
			setTitle('');
			setDescription('');
			setCategory('General');
			setOptions(['', '']);
			setIsMultipleChoice(false);
			setIsAnonymous(false);
			setAllowUserOptions(false);
			setHasExpiry(false);
			setExpiryDays('3');
			setPostToFeed(true);
			setPinned(false);
			setFormError('');
		}
	}, [isOpen]);
	/* eslint-enable react-hooks/set-state-in-effect */

	if (!isOpen) return null;

	const handleApplyTemplate = (template: (typeof TEMPLATES)[0]) => {
		setTitle(template.title);
		setCategory(template.category);
		setOptions([...template.options]);
	};

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

	const handleOptionKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (index === options.length - 1) {
				handleAddOption();
			} else {
				optionRefs.current[index + 1]?.focus();
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError('');

		if (!title.trim()) {
			setFormError('Please provide a poll question or title.');
			return;
		}

		const cleanOptions = options.filter((o) => o.trim().length > 0);
		if (cleanOptions.length < 2) {
			setFormError('Please enter at least 2 non-empty options.');
			return;
		}

		setIsSubmitting(true);
		try {
			let expiresAt: string | undefined = undefined;
			if (hasExpiry) {
				const days = parseInt(expiryDays, 10) || 3;
				const exp = new Date();
				exp.setDate(exp.getDate() + days);
				expiresAt = exp.toISOString();
			}

			const res = await onSubmit({
				title: title.trim(),
				description: description.trim() || undefined,
				category,
				options: cleanOptions,
				isMultipleChoice,
				isAnonymous,
				allowUserOptions,
				expiresAt,
				pinned,
				postToFeed,
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

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
			<div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
				{/* Modal Header */}
				<div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/50">
					<div className="flex items-center gap-2.5">
						<div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
							<FiBarChart2 size={16} />
						</div>
						<div>
							<h3 className="text-sm font-bold text-text-primary">
								Create New Poll
							</h3>
							<p className="text-[11px] text-text-muted">
								Gather member votes, feedback, and decisions
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-secondary cursor-pointer"
					>
						<FiX size={16} />
					</button>
				</div>

				{/* Modal Body */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto grow text-xs">
					{formError && (
						<div className="p-3 rounded-xl bg-danger-bg border border-danger/20 text-danger text-xs font-medium">
							⚠️ {formError}
						</div>
					)}

					{/* Quick Templates */}
					<div className="space-y-1.5">
						<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
							Quick Templates
						</span>
						<div className="flex flex-wrap gap-1.5">
							{TEMPLATES.map((tmpl) => (
								<button
									key={tmpl.name}
									type="button"
									onClick={() => handleApplyTemplate(tmpl)}
									className="px-2.5 py-1 rounded-lg bg-surface-secondary hover:bg-primary-light hover:text-primary border border-border text-[11px] font-medium transition-colors cursor-pointer"
								>
									⚡ {tmpl.name}
								</button>
							))}
						</div>
					</div>

					{/* Title */}
					<div className="space-y-1">
						<label className="block text-xs font-bold text-text-primary">
							Poll Question / Title <span className="text-danger">*</span>
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Which date works best for the hackathon?"
							className="w-full rounded-xl border border-border bg-surface-secondary px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
							autoFocus
						/>
					</div>

					{/* Description */}
					<div className="space-y-1">
						<label className="block text-xs font-medium text-text-muted">
							Details / Context (Optional)
						</label>
						<textarea
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add context or guidelines for voters..."
							className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
						/>
					</div>

					{/* Category */}
					<div className="space-y-1.5">
						<label className="block text-xs font-medium text-text-muted">
							Category
						</label>
						<div className="flex flex-wrap gap-1.5">
							{CATEGORIES.map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => setCategory(cat)}
									className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
										category === cat
											? 'bg-primary text-white shadow-2xs'
											: 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border'
									}`}
								>
									{cat}
								</button>
							))}
						</div>
					</div>

					{/* Options Builder */}
					<div className="space-y-2 pt-1">
						<div className="flex items-center justify-between">
							<label className="block text-xs font-bold text-text-primary">
								Poll Options <span className="text-danger">*</span>
							</label>
							<span className="text-[10px] text-text-muted">
								Press Enter to add next option
							</span>
						</div>

						<div className="space-y-2">
							{options.map((opt, idx) => (
								<div key={idx} className="flex items-center gap-2">
									<span className="h-6 w-6 rounded-full bg-surface-secondary border border-border text-[11px] font-bold text-text-muted flex items-center justify-center shrink-0">
										{idx + 1}
									</span>
									<input
										ref={(el) => {
											optionRefs.current[idx] = el;
										}}
										type="text"
										value={opt}
										onChange={(e) => handleOptionChange(idx, e.target.value)}
										onKeyDown={(e) => handleOptionKeyDown(idx, e)}
										placeholder={`Option ${idx + 1}...`}
										className="grow rounded-xl border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
									/>
									{options.length > 2 && (
										<button
											type="button"
											onClick={() => handleRemoveOption(idx)}
											className="text-text-muted hover:text-danger p-1.5 cursor-pointer transition-colors"
											title="Remove Option"
										>
											<FiTrash2 size={14} />
										</button>
									)}
								</div>
							))}
						</div>

						<button
							type="button"
							onClick={handleAddOption}
							className="w-full mt-2 py-2 rounded-xl border border-dashed border-border hover:border-primary/50 text-text-muted hover:text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-surface-secondary/40"
						>
							<FiPlus size={14} /> Add Option
						</button>
					</div>

					{/* Voting Rules */}
					<div className="pt-3 border-t border-border space-y-2.5">
						<span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
							Voting Rules &amp; Visibility
						</span>

						{/* Multi-choice */}
						<button
							type="button"
							onClick={() => setIsMultipleChoice(!isMultipleChoice)}
							className="flex items-center justify-between cursor-pointer group w-full text-left py-1"
						>
							<div className="flex items-center gap-2">
								<FiLayers className="text-text-muted group-hover:text-primary transition-colors" size={14} />
								<div>
									<span className="font-semibold text-text-primary block text-xs">
										Multiple Choice Voting
									</span>
									<span className="text-[10px] text-text-muted block">
										Voters can select more than one option
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

						{/* Anonymous */}
						<button
							type="button"
							onClick={() => setIsAnonymous(!isAnonymous)}
							className="flex items-center justify-between cursor-pointer group w-full text-left py-1"
						>
							<div className="flex items-center gap-2">
								<FiLock className="text-text-muted group-hover:text-primary transition-colors" size={14} />
								<div>
									<span className="font-semibold text-text-primary block text-xs">
										Anonymous Ballots
									</span>
									<span className="text-[10px] text-text-muted block">
										Hide voter identities and names from results
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

						{/* Member Options */}
						<button
							type="button"
							onClick={() => setAllowUserOptions(!allowUserOptions)}
							className="flex items-center justify-between cursor-pointer group w-full text-left py-1"
						>
							<div className="flex items-center gap-2">
								<FiUserCheck className="text-text-muted group-hover:text-primary transition-colors" size={14} />
								<div>
									<span className="font-semibold text-text-primary block text-xs">
										Allow Member-Submitted Options
									</span>
									<span className="text-[10px] text-text-muted block">
										Club members can suggest new options to vote on
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

						{/* Auto Expiry */}
						<div className="space-y-1.5">
							<button
								type="button"
								onClick={() => setHasExpiry(!hasExpiry)}
								className="flex items-center justify-between cursor-pointer group w-full text-left py-1"
							>
								<div className="flex items-center gap-2">
									<FiClock className="text-text-muted group-hover:text-primary transition-colors" size={14} />
									<div>
										<span className="font-semibold text-text-primary block text-xs">
											Automatic Deadline
										</span>
										<span className="text-[10px] text-text-muted block">
											Close voting automatically after duration
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
									<span className="text-[10px] text-text-muted">Deadline:</span>
									<select
										value={expiryDays}
										onChange={(e) => setExpiryDays(e.target.value)}
										className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1 text-xs text-text-primary focus:outline-none"
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

					{/* Modal Footer */}
					<div className="pt-4 border-t border-border flex items-center justify-between gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary cursor-pointer"
						>
							Cancel
						</button>

						<button
							type="submit"
							disabled={isSubmitting}
							className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
						>
							{isSubmitting ? (
								<>
									<span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
									<span>Publishing...</span>
								</>
							) : (
								<>
									<FiSend size={13} />
									<span>Publish Poll</span>
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
