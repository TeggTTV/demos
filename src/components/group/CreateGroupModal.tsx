'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import {
	BANNER_COLOR_PRESETS,
	BANNER_IMAGE_PRESETS,
} from '@/constants/bannerPresets';
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

	if (!isOpen) return null;

	const handleCreateGroup = async (e: React.FormEvent) => {
		e.preventDefault();
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
				name,
				tagline,
				description,
				category,
				meetingFrequency: finalFrequency,
				meetingLocation: location,
				minMembers: 5,
				maxMembers: 100,
				bannerUrl: finalBanner,
				discordUrl,
				instagramUrl,
				websiteUrl,
				tags,
				isPrivate,
			});

			if (res.success && res.group) {
				onClose();
				if (onSuccess) onSuccess(res.group.id);
			} else {
				setError(res.error || 'Failed to create club. Please try again.');
			}
		} catch {
			setError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 my-8"
				>
					<div className="flex items-center justify-between border-b border-border pb-3">
						<div>
							<h2 className="text-lg font-bold text-text-primary">
								Register a New Campus Club
							</h2>
							<p className="text-xs text-text-muted">
								Create a hub for your organization to promote, recruit, and track attendance.
							</p>
						</div>
						<button
							onClick={onClose}
							className="text-text-muted hover:text-text-primary p-1 rounded-lg cursor-pointer"
						>
							✕
						</button>
					</div>

					<form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
						{error && (
							<div className="text-xs text-danger bg-danger-bg p-2.5 rounded-lg text-center">
								{error}
							</div>
						)}

						<Input
							label="Club Name"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>

						<Input
							label="Tagline / Short Hook"
							value={tagline}
							onChange={(e) => setTagline(e.target.value)}
						/>

						<Select
							label="Category"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						>
							{CLUB_CATEGORIES.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
							))}
						</Select>

						<Textarea
							label="Mission & Description"
							required
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>

						<Input
							label="Meeting Location / Room"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
						/>

						{/* Banner Selector */}
						<div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-3">
							<div className="flex items-center justify-between">
								<div>
									<span className="text-[11px] font-bold text-text-primary uppercase tracking-wider block">
										Club Banner
									</span>
									<span className="text-[10px] text-text-muted">
										Select a color theme or upload a custom banner image
									</span>
								</div>
								<label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
									<Checkbox
										checked={enableCustomBanner}
										onChange={() =>
											setEnableCustomBanner(
												!enableCustomBanner,
											)
										}
									/>
									<span>Upload custom image</span>
								</label>
							</div>

							<div className="relative h-24 w-full rounded-lg overflow-hidden border border-border flex items-center justify-center">
								{enableCustomBanner && customBannerPreview ? (
									<>
										<Image
											src={customBannerPreview}
											alt="Banner Preview"
											fill
											unoptimized
											className="object-cover"
										/>
										<button
											type="button"
											onClick={() =>
												setCustomBannerPreview('')
											}
											className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-md px-2 py-0.5 text-[10px] font-semibold cursor-pointer z-10"
										>
											Remove
										</button>
									</>
								) : (
									<div className="relative w-full h-full flex items-center justify-center">
										<ClubBanner
											bannerUrl={selectedBannerColor}
											alt={name || 'Banner Preview'}
											category={category}
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-sm shadow-inner drop-shadow">
											{name || 'Banner Preview'}
										</div>
									</div>
								)}
							</div>

							{enableCustomBanner ? (
								<div className="space-y-1">
									<label className="block text-[10px] font-semibold text-text-muted uppercase">
										Select Image File
									</label>
									{fileSizeError && (
										<div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-[11px] text-danger font-medium">
											<span className="shrink-0 mt-0.5">⚠️</span>
											<span>
												{fileSizeError}{' '}
												<a
													href="https://joeyjazwinski.com/developer-tools/image-compressor"
													target="_blank"
													rel="noopener noreferrer"
													className="underline font-semibold hover:text-danger/80 transition-colors"
												>
													Compress your image here →
												</a>
											</span>
										</div>
									)}
									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												if (file.size > 200000) {
													setFileSizeError(
														'Image is too large (max 200 KB).',
													);
													e.target.value = '';
													return;
												}
												setFileSizeError('');
												const reader = new FileReader();
												reader.onload = () => {
													setCustomBannerPreview(
														reader.result as string,
													);
												};
												reader.readAsDataURL(file);
											}
										}}
										className="block w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 cursor-pointer"
									/>
								</div>
							) : (
								<Select
									label="Banner Style Preset"
									value={selectedBannerColor}
									onChange={(e) =>
										setSelectedBannerColor(e.target.value)
									}
								>
									<optgroup label="📸 Campus & Activity Photo Banners">
										{BANNER_IMAGE_PRESETS.map((preset) => (
											<option
												key={preset.id}
												value={preset.url}
											>
												{preset.name} ({preset.category})
											</option>
										))}
									</optgroup>
									<optgroup label="🎨 Modern Gradient Presets">
										{BANNER_COLOR_PRESETS.map((preset) => (
											<option
												key={preset.id}
												value={preset.value}
											>
												{preset.name}
											</option>
										))}
									</optgroup>
								</Select>
							)}
						</div>

						{/* Custom Meeting Days Selector */}
						<div className="rounded-xl border border-border bg-surface-secondary/40 p-3 space-y-2">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-text-primary">
									Meeting Schedule
								</span>
								<label className="flex items-center gap-1.5 text-text-secondary cursor-pointer">
									<Checkbox
										checked={isCustomFreq}
										onChange={() =>
											setIsCustomFreq(!isCustomFreq)
										}
									/>
									<span>Custom Days &amp; Time</span>
								</label>
							</div>

							{isCustomFreq ? (
								<div className="space-y-2 pt-1">
									<div className="flex flex-wrap gap-1.5">
										{[
											'Mon',
											'Tue',
											'Wed',
											'Thu',
											'Fri',
											'Sat',
											'Sun',
										].map((day) => (
											<button
												key={day}
												type="button"
												onClick={() =>
													setCustomDays((prev) => ({
														...prev,
														[day]: !prev[day],
													}))
												}
												className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
													customDays[day]
														? 'bg-primary text-white border-primary'
														: 'bg-surface text-text-secondary border-border'
												}`}
											>
												{day}
											</button>
										))}
									</div>
									<Input
										type="time"
										value={customTime}
										onChange={(e) =>
											setCustomTime(e.target.value)
										}
									/>
								</div>
							) : (
								<Select
									value={frequency}
									onChange={(e) =>
										setFrequency(e.target.value)
									}
								>
									<option value="Weekly">Weekly</option>
									<option value="Bi-weekly">Bi-weekly</option>
									<option value="Fortnightly">
										Fortnightly
									</option>
									<option value="Monthly">Monthly</option>
								</Select>
							)}
						</div>

						{/* Social handles */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<Input
								label="Discord URL"
								value={discordUrl}
								onChange={(e) => setDiscordUrl(e.target.value)}
							/>
							<Input
								label="Instagram URL"
								value={instagramUrl}
								onChange={(e) =>
									setInstagramUrl(e.target.value)
								}
							/>
							<Input
								label="Website URL"
								value={websiteUrl}
								onChange={(e) => setWebsiteUrl(e.target.value)}
							/>
						</div>

						<Input
							label="Focus Tags (Comma separated)"
							value={tagsInput}
							onChange={(e) => setTagsInput(e.target.value)}
						/>

						{/* Privacy Setting */}
						<div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5">
							<Checkbox
								id="create-group-is-private-checkbox"
								checked={isPrivate}
								onChange={(e) => setIsPrivate(e.target.checked)}
								label={
									<div className="ml-1">
										<span className="font-bold text-text-primary text-xs block">
											🔒 Private Club Hub (Hidden from Explore &amp; Guests)
										</span>
										<span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
											When checked, non-members and guests cannot discover this club on the Explore directory or view the club hub without an invite or officer approval.
										</span>
									</div>
								}
							/>
						</div>

						<div className="pt-2 flex justify-end gap-2">
							<button
								type="button"
								onClick={onClose}
								className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer hover:bg-surface-secondary transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50 cursor-pointer transition-all"
							>
								{loading ? 'Registering...' : 'Register Club'}
							</button>
						</div>
					</form>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
