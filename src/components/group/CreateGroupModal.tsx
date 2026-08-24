'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { BANNER_COLOR_PRESETS } from '@/constants/bannerPresets';
import ClubBanner from '@/components/ui/ClubBanner';
import { CLUB_CATEGORIES, compileFrequency } from '@/constants/categories';
import { Group } from '@/types/models';

interface CreateGroupModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateGroup: (groupData: {
		name: string;
		tagline?: string;
		description: string;
		category: string;
		meetingFrequency: string;
		meetingLocation?: string;
		minMembers: number;
		maxMembers: number;
		bannerUrl?: string;
		logoUrl?: string;
		websiteUrl?: string;
		instagramUrl?: string;
		discordUrl?: string;
		tags?: string[];
		isPrivate?: boolean;
	}) => Promise<{ success: boolean; group?: Group; error?: string }>;
	onSuccess?: (groupId: string) => void;
}

export default function CreateGroupModal({
	isOpen,
	onClose,
	onCreateGroup,
	onSuccess,
}: CreateGroupModalProps) {
	const [name, setName] = useState('');
	const [tagline, setTagline] = useState('');
	const [category, setCategory] = useState<string>(CLUB_CATEGORIES[0]);
	const [description, setDescription] = useState('');
	const [location, setLocation] = useState('');
	const [frequency, setFrequency] = useState('Weekly');
	const [enableCustomBanner, setEnableCustomBanner] = useState(false);
	const [selectedBannerColor, setSelectedBannerColor] = useState(
		BANNER_COLOR_PRESETS[0].value,
	);
	const [customBannerPreview, setCustomBannerPreview] = useState('');
	const [discordUrl, setDiscordUrl] = useState('');
	const [instagramUrl, setInstagramUrl] = useState('');
	const [websiteUrl, setWebsiteUrl] = useState('');
	const [tagsInput, setTagsInput] = useState('');
	const [isPrivate, setIsPrivate] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [fileSizeError, setFileSizeError] = useState('');

	// Custom frequency state variables
	const [isCustomFreq, setIsCustomFreq] = useState(false);
	const [customDays, setCustomDays] = useState<Record<string, boolean>>({
		Mon: false,
		Tue: false,
		Wed: false,
		Thu: false,
		Fri: false,
		Sat: false,
		Sun: false,
	});
	const [customTime, setCustomTime] = useState('18:00');

	const [currentStep, setCurrentStep] = useState<'details' | 'logistics'>(
		'details',
	);

	if (!isOpen) return null;

	const handleCreateGroup = async (e: React.FormEvent) => {
		e.preventDefault();
		if (currentStep === 'details') {
			if (!name.trim() || !description.trim()) {
				setError('Please enter a club name and description.');
				return;
			}
			setError('');
			setCurrentStep('logistics');
			return;
		}

		setError('');
		setLoading(true);

		const finalBanner = enableCustomBanner
			? customBannerPreview
			: selectedBannerColor;
		const finalFrequency = compileFrequency(
			isCustomFreq,
			frequency,
			customDays,
			customTime,
		);
		const tags = tagsInput
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);

		try {
			const res = await onCreateGroup({
				name: name.trim(),
				tagline: tagline.trim() || undefined,
				description: description.trim(),
				category,
				meetingFrequency: finalFrequency,
				meetingLocation: location.trim() || undefined,
				minMembers: 1,
				maxMembers: 50,
				bannerUrl: finalBanner,
				websiteUrl: websiteUrl.trim() || undefined,
				instagramUrl: instagramUrl.trim() || undefined,
				discordUrl: discordUrl.trim() || undefined,
				tags,
				isPrivate,
			});

			if (res.success && res.group) {
				onClose();
				if (onSuccess) onSuccess(res.group.id);
			} else {
				setError(res.error || 'Failed to create group');
			}
		} catch (err) {
			const errMsg =
				err instanceof Error ? err.message : 'Something went wrong';
			setError(errMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
				<motion.div
					initial={{ opacity: 0, scale: 0.96, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, y: 10 }}
					transition={{ duration: 0.2 }}
					className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
				>
					{/* Modal Header */}
					<div className="p-5 border-b border-border bg-surface-secondary/20 flex items-center justify-between shrink-0">
						<div>
							<h3 className="text-base font-bold text-text-primary">
								Register New Student Organization
							</h3>
							<p className="text-xs text-text-muted mt-0.5">
								{currentStep === 'details'
									? 'Step 1 of 2: Club identity & overview'
									: 'Step 2 of 2: Schedule, banner & social links'}
							</p>
						</div>

						{/* Step indicator pills */}
						<div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
							<button
								type="button"
								onClick={() => setCurrentStep('details')}
								className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
									currentStep === 'details'
										? 'bg-primary text-white'
										: 'text-text-muted hover:text-text-primary'
								}`}
							>
								1. Details
							</button>
							<button
								type="button"
								onClick={() => {
									if (name.trim() && description.trim()) {
										setCurrentStep('logistics');
									}
								}}
								className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
									currentStep === 'logistics'
										? 'bg-primary text-white'
										: 'text-text-muted hover:text-text-primary'
								}`}
							>
								2. Banner &amp; Info
							</button>
						</div>
					</div>

					{/* Form Scrollable Body */}
					<form
						onSubmit={handleCreateGroup}
						className="flex flex-col grow overflow-hidden"
					>
						<div className="p-5 overflow-y-auto space-y-4 grow">
							{error && (
								<div className="rounded-xl border border-danger/20 bg-danger-bg p-3 text-xs text-danger font-medium">
									{error}
								</div>
							)}

							{currentStep === 'details' ? (
								<div className="space-y-4 animate-in fade-in duration-150">
									<Input
										label="Club Name *"
										placeholder="e.g. Artificial Intelligence Association"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
									/>

									<Input
										label="Tagline (Optional)"
										placeholder="e.g. Advancing machine intelligence on campus"
										value={tagline}
										onChange={(e) =>
											setTagline(e.target.value)
										}
									/>

									<Select
										label="Category"
										value={category}
										onChange={(e) =>
											setCategory(e.target.value)
										}
									>
										{CLUB_CATEGORIES.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</Select>

									<Textarea
										label="Description *"
										placeholder="What is your club about? What activities and projects do you run?"
										rows={3}
										value={description}
										onChange={(e) =>
											setDescription(e.target.value)
										}
										required
									/>

									{/* Privacy Setting */}
									<div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5">
										<Checkbox
											id="create-group-is-private-checkbox"
											checked={isPrivate}
											onChange={(e) =>
												setIsPrivate(e.target.checked)
											}
											label={
												<div className="ml-1">
													<span className="font-bold text-text-primary text-xs block">
														🔒 Private Club (Hidden from Explore &amp; Guests)
													</span>
													<span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
														When checked, unauthenticated guests and non-members cannot see this club on the Explore directory.
													</span>
												</div>
											}
										/>
									</div>
								</div>
							) : (
								<div className="space-y-4 animate-in fade-in duration-150">
									{/* Meeting Logistics */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<Input
											label="Meeting Location"
											placeholder="e.g. Science Hall Rm 302"
											value={location}
											onChange={(e) =>
												setLocation(e.target.value)
											}
										/>

										<div>
											<div className="flex items-center justify-between mb-1">
												<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider">
													Meeting Schedule
												</label>
												<button
													type="button"
													onClick={() =>
														setIsCustomFreq(
															!isCustomFreq,
														)
													}
													className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
												>
													{isCustomFreq
														? 'Use Preset'
														: 'Custom Days'}
												</button>
											</div>

											{isCustomFreq ? (
												<div className="space-y-2 rounded-xl border border-border bg-surface-secondary/30 p-2.5">
													<div className="flex flex-wrap gap-1.5">
														{[
															'Mon',
															'Tue',
															'Wed',
															'Thu',
															'Fri',
															'Sat',
															'Sun',
														].map((d) => (
															<button
																key={d}
																type="button"
																onClick={() =>
																	setCustomDays(
																		(
																			prev,
																		) => ({
																			...prev,
																			[d]: !prev[
																				d
																			],
																		}),
																	)
																}
																className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
																	customDays[
																		d
																	]
																		? 'bg-primary text-white border-primary'
																		: 'border-border bg-surface text-text-secondary'
																}`}
															>
																{d}
															</button>
														))}
													</div>
													<input
														type="time"
														value={customTime}
														onChange={(e) =>
															setCustomTime(
																e.target.value,
															)
														}
														className="w-full rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-text-primary"
													/>
												</div>
											) : (
												<Select
													value={frequency}
													onChange={(e) =>
														setFrequency(
															e.target.value,
														)
													}
												>
													<option value="Weekly">
														Weekly
													</option>
													<option value="Bi-weekly">
														Bi-weekly
													</option>
													<option value="Monthly">
														Monthly
													</option>
												</Select>
											)}
										</div>
									</div>

									{/* Banner Selector */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
												Club Banner
											</label>
											<button
												type="button"
												onClick={() =>
													setEnableCustomBanner(
														!enableCustomBanner,
													)
												}
												className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
											>
												{enableCustomBanner
													? 'Choose Preset'
													: 'Upload Custom Banner'}
											</button>
										</div>

										<div className="h-20 w-full rounded-xl overflow-hidden relative border border-border shadow-2xs">
											<ClubBanner
												bannerUrl={
													enableCustomBanner
														? customBannerPreview
														: selectedBannerColor
												}
												category={category}
											/>
										</div>

										{enableCustomBanner ? (
											<div className="space-y-1">
												<input
													type="file"
													accept="image/*"
													onChange={(e) => {
														const file =
															e.target.files?.[0];
														if (!file) return;
														if (
															file.size > 2000000
														) {
															setFileSizeError(
																'Image must be under 2MB',
															);
															return;
														}
														setFileSizeError('');
														const reader =
															new FileReader();
														reader.onload = (ev) =>
															setCustomBannerPreview(
																ev.target
																	?.result as string,
															);
														reader.readAsDataURL(
															file,
														);
													}}
													className="text-xs text-text-secondary file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
												/>
												{fileSizeError && (
													<p className="text-[10px] text-danger">
														{fileSizeError}
													</p>
												)}
											</div>
										) : (
											<div className="flex flex-wrap gap-1.5 pt-1">
												{BANNER_COLOR_PRESETS.map(
													(b) => (
														<button
															key={b.id}
															type="button"
															onClick={() =>
																setSelectedBannerColor(
																	b.value,
																)
															}
															className={`h-6 w-8 rounded-lg border-2 transition-all cursor-pointer ${
																selectedBannerColor ===
																b.value
																	? 'border-primary scale-110 shadow-xs'
																	: 'border-transparent opacity-80 hover:opacity-100'
															}`}
															style={{
																background:
																	b.value,
															}}
															title={b.name}
														/>
													),
												)}
											</div>
										)}
									</div>

									{/* Social URLs */}
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
										<Input
											label="Discord"
											placeholder="https://..."
											value={discordUrl}
											onChange={(e) =>
												setDiscordUrl(e.target.value)
											}
										/>
										<Input
											label="Instagram"
											placeholder="https://..."
											value={instagramUrl}
											onChange={(e) =>
												setInstagramUrl(e.target.value)
											}
										/>
										<Input
											label="Website"
											placeholder="https://..."
											value={websiteUrl}
											onChange={(e) =>
												setWebsiteUrl(e.target.value)
											}
										/>
									</div>

									<Input
										label="Tags (Comma separated)"
										placeholder="e.g. coding, ai, workshops"
										value={tagsInput}
										onChange={(e) =>
											setTagsInput(e.target.value)
										}
									/>
								</div>
							)}
						</div>

						{/* Footer Actions */}
						<div className="p-4 border-t border-border bg-surface flex items-center justify-between shrink-0">
							{currentStep === 'logistics' ? (
								<button
									type="button"
									onClick={() => setCurrentStep('details')}
									className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary cursor-pointer transition-colors"
								>
									← Back
								</button>
							) : (
								<button
									type="button"
									onClick={onClose}
									className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary cursor-pointer transition-colors"
								>
									Cancel
								</button>
							)}

							<div className="flex items-center gap-2">
								{currentStep === 'details' ? (
									<button
										type="submit"
										className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm cursor-pointer transition-all"
									>
										Next: Logistics &amp; Banner →
									</button>
								) : (
									<button
										type="submit"
										disabled={loading}
										className="rounded-xl bg-primary px-6 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50 cursor-pointer transition-all"
									>
										{loading
											? 'Registering...'
											: 'Register Club'}
									</button>
								)}
							</div>
						</div>
					</form>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
