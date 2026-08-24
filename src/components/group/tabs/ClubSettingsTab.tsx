import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiCalendar,
	FiMapPin,
	FiShare2,
	FiLink,
	FiKey,
	FiInstagram,
	FiGlobe,
} from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import QRCodeSVG from '@/components/ui/QRCode';
import { ClubInvite, Group } from '@/types/models';
import {
	BANNER_COLOR_PRESETS,
	BANNER_IMAGE_PRESETS,
} from '@/constants/bannerPresets';
import ClubBanner from '@/components/ui/ClubBanner';
import ConfirmModal from '@/components/modals/ConfirmModal';

interface ClubSettingsTabProps {
	group: Group;
	canManage: boolean;
	isLeader: boolean;
	invites?: ClubInvite[];
	generateClubInvite: (
		groupId: string,
	) => Promise<{ success: boolean; code?: string; error?: string }>;
	deleteClubInvites: (
		groupId: string,
	) => Promise<{ success: boolean; error?: string }>;
	updateGroupSettings: (
		groupId: string,
		settings: {
			name?: string;
			tagline?: string;
			description?: string;
			category?: string;
			meetingFrequency?: string;
			meetingLocation?: string;
			isPrivate?: boolean;
			profanityFilter?: boolean;
			bannerUrl?: string;
			logoUrl?: string;
			websiteUrl?: string;
			instagramUrl?: string;
			discordUrl?: string;
			tags?: string[];
		},
	) => Promise<{ success: boolean; error?: string }>;
	fetchGroups: () => Promise<void>;
}

export default function ClubSettingsTab({
	group,
	canManage,
	isLeader,
	invites = [],
	generateClubInvite,
	deleteClubInvites,
	updateGroupSettings,
	fetchGroups,
}: ClubSettingsTabProps) {
	const [isEditingSettings, setIsEditingSettings] = useState(false);
	const [settingsName, setSettingsName] = useState(group.name);
	const [settingsTagline, setSettingsTagline] = useState(group.tagline || '');
	const [settingsDesc, setSettingsDesc] = useState(group.description);
	const [settingsLocation, setSettingsLocation] = useState(
		group.meetingLocation || '',
	);
	const [settingsIsPrivate, setSettingsIsPrivate] = useState(
		group.isPrivate || false,
	);
	const [settingsEnableCustomBanner, setSettingsEnableCustomBanner] = useState(
		group.bannerUrl?.startsWith('data:') ||
			group.bannerUrl?.startsWith('http') ||
			false,
	);
	const [settingsBannerPreview, setSettingsBannerPreview] = useState(
		group.bannerUrl?.startsWith('data:') ||
			group.bannerUrl?.startsWith('http')
			? group.bannerUrl
			: '',
	);
	const [settingsBannerColor, setSettingsBannerColor] = useState(
		group.bannerUrl || BANNER_COLOR_PRESETS[0].value,
	);
	const [settingsDiscord, setSettingsDiscord] = useState(
		group.discordUrl || '',
	);
	const [settingsInstagram, setSettingsInstagram] = useState(
		group.instagramUrl || '',
	);
	const [settingsWebsite, setSettingsWebsite] = useState(
		group.websiteUrl || '',
	);
	const [fileSizeErrorSettings, setFileSizeErrorSettings] = useState('');
	const [showDeleteInviteModal, setShowDeleteInviteModal] = useState(false);
	const [updatingSettings, setUpdatingSettings] = useState(false);
	const [settingsSuccess, setSettingsSuccess] = useState(false);

	const [generatedInviteCode, setGeneratedInviteCode] = useState('');
	const [showInviteQRCode, setShowInviteQRCode] = useState(true);
	const [copiedInvite, setCopiedInvite] = useState(false);
	const [copiedInviteLink, setCopiedInviteLink] = useState(false);

	// Find active invite in database
	const existingInvite = invites.find(
		(i) => i.groupId === group.id && i.status === 'ACTIVE',
	);
	const activeInviteCode = generatedInviteCode || existingInvite?.code || '';

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (existingInvite?.code && !generatedInviteCode) {
			setGeneratedInviteCode(existingInvite.code);
		}
	}, [existingInvite, generatedInviteCode]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const inviteUrl =
		typeof window !== 'undefined' && activeInviteCode
			? `${window.location.origin}/join/${activeInviteCode}`
			: activeInviteCode
				? `/join/${activeInviteCode}`
				: '';

	const handleSaveClubSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		setUpdatingSettings(true);
		setSettingsSuccess(false);

		const banner = settingsEnableCustomBanner
			? settingsBannerPreview
			: settingsBannerColor;

		const res = await updateGroupSettings(group.id, {
			name: settingsName,
			tagline: settingsTagline,
			description: settingsDesc,
			meetingLocation: settingsLocation,
			isPrivate: settingsIsPrivate,
			bannerUrl: banner,
			discordUrl: settingsDiscord,
			instagramUrl: settingsInstagram,
			websiteUrl: settingsWebsite,
		});

		setUpdatingSettings(false);
		if (res.success) {
			setSettingsSuccess(true);
			await fetchGroups();
			setTimeout(() => {
				setSettingsSuccess(false);
				setIsEditingSettings(false);
			}, 1500);
		}
	};

	return (
		<main className="grow mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
				<div className="flex justify-between items-center border-b border-border pb-4">
					<div>
						<h2 className="text-xl font-bold text-text-primary">
							Club Details &amp; Settings
						</h2>
						<p className="text-xs text-text-muted mt-0.5">
							View information about {group.name} and configure settings if you are an officer.
						</p>
					</div>
					{canManage && !isEditingSettings && (
						<button
							onClick={() => {
								setSettingsName(group.name);
								setSettingsTagline(group.tagline || '');
								setSettingsDesc(group.description);
								setSettingsLocation(group.meetingLocation || '');
								setSettingsIsPrivate(group.isPrivate || false);
								setSettingsEnableCustomBanner(
									group.bannerUrl?.startsWith('data:') ||
										group.bannerUrl?.startsWith('http') ||
										false,
								);
								if (
									group.bannerUrl?.startsWith('data:') ||
									group.bannerUrl?.startsWith('http')
								) {
									setSettingsBannerPreview(group.bannerUrl);
								} else {
									setSettingsBannerColor(
										group.bannerUrl || BANNER_COLOR_PRESETS[0].value,
									);
								}
								setSettingsDiscord(group.discordUrl || '');
								setSettingsInstagram(group.instagramUrl || '');
								setSettingsWebsite(group.websiteUrl || '');
								setIsEditingSettings(true);
							}}
							className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-2xs transition-all cursor-pointer"
						>
							Edit Club Info
						</button>
					)}
				</div>

				{/* Invite Link & Code Generator Box */}
				{isLeader && !isEditingSettings && (
					<div className="rounded-2xl bg-primary-light/50 border border-primary/20 p-5 space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/15 pb-3">
							<div>
								<span className="text-xs font-bold text-primary flex items-center gap-1.5">
									<FiShare2 /> Shareable Recruitment Invite
								</span>
								<p className="text-[11px] text-text-muted mt-0.5">
									Share a 1-click link, code, or QR code with prospective members to join immediately.
								</p>
							</div>
							<div className="flex items-center gap-2 self-start sm:self-auto">
								<button
									type="button"
									onClick={async () => {
										const res = await generateClubInvite(group.id);
										if (res.success && res.code) {
											setGeneratedInviteCode(res.code);
										}
									}}
									className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-2xs transition-all cursor-pointer"
								>
									{activeInviteCode
										? 'Regenerate Invite'
										: 'Generate Invite Link'}
								</button>
								{activeInviteCode && (
									<button
										type="button"
										onClick={() => setShowDeleteInviteModal(true)}
										className="rounded-lg bg-danger px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 shadow-2xs transition-all cursor-pointer"
									>
										Delete Link
									</button>
								)}
							</div>
						</div>

						{activeInviteCode ? (
							<div className="space-y-4">
								{/* Direct 1-Click Link */}
								<div>
									<label className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-1 items-center gap-1">
										<FiLink size={11} /> 1-Click Direct Join Link
									</label>
									<div className="flex items-center gap-2">
										<input
											readOnly
											value={inviteUrl}
											className="grow rounded-lg border border-primary/30 bg-surface px-3 py-2 text-xs font-mono font-bold text-primary"
										/>
										<button
											type="button"
											onClick={() => {
												if (inviteUrl) {
													navigator.clipboard.writeText(inviteUrl);
													setCopiedInviteLink(true);
													setTimeout(
														() => setCopiedInviteLink(false),
														2000,
													);
												}
											}}
											className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all cursor-pointer shrink-0 flex items-center gap-1"
										>
											<FiLink size={12} />
											<span>
												{copiedInviteLink
													? 'Link Copied!'
													: 'Copy Link'}
											</span>
										</button>
									</div>
								</div>

								{/* Raw Code */}
								<div>
									<label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 items-center gap-1">
										<FiKey size={11} /> Invite Code (For Explore Clubs Page)
									</label>
									<div className="flex items-center gap-2">
										<input
											readOnly
											value={activeInviteCode}
											className="grow rounded-lg border border-border bg-surface px-3 py-2 text-xs font-mono font-bold text-text-primary"
										/>
										<button
											type="button"
											onClick={() => {
												navigator.clipboard.writeText(
													activeInviteCode,
												);
												setCopiedInvite(true);
												setTimeout(
													() => setCopiedInvite(false),
													2000,
												);
											}}
											className="rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer shrink-0 flex items-center gap-1"
										>
											<FiKey size={12} />
											<span>
												{copiedInvite
													? 'Code Copied!'
													: 'Copy Code'}
											</span>
										</button>
									</div>
								</div>

								{/* Recruitment QR Code Generator & Display */}
								<div className="rounded-xl border border-primary/20 bg-surface p-4 space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-bold text-primary uppercase tracking-wider">
											📱 Recruitment QR Code
										</span>
										<Checkbox
											id="toggle-invite-qr"
											checked={showInviteQRCode}
											onChange={(e) =>
												setShowInviteQRCode(e.target.checked)
											}
											label={
												<span className="text-xs font-semibold text-text-secondary select-none">
													Display QR Code
												</span>
											}
										/>
									</div>

									<AnimatePresence>
										{showInviteQRCode && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: 'auto' }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.2 }}
												className="overflow-hidden pt-2 flex flex-col sm:flex-row items-center gap-5"
											>
												<div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0">
													<QRCodeSVG
														value={inviteUrl}
														size={160}
														fgColor="#0f172a"
														bgColor="#ffffff"
													/>
												</div>

												<div className="space-y-2 text-center sm:text-left">
													<h4 className="text-sm font-bold text-text-primary">
														Scan to Join {group.name}
													</h4>
													<p className="text-xs text-text-muted leading-relaxed">
														Display this QR code at campus club rush, orientation tables, or print it on recruiting flyers for instant 1-scan onboarding.
													</p>
													<div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
														<button
															type="button"
															onClick={() => {
																if (inviteUrl) {
																	navigator.clipboard.writeText(inviteUrl);
																	setCopiedInviteLink(true);
																	setTimeout(() => setCopiedInviteLink(false), 2000);
																}
															}}
															className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
														>
															<FiLink size={12} />
															<span>{copiedInviteLink ? 'Link Copied!' : 'Copy Join Link'}</span>
														</button>
													</div>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>
						) : (
							<p className="text-xs text-text-secondary">
								Click <strong>Generate Invite Link</strong> to create a secure, direct link and QR code (e.g.{' '}
								<code className="font-mono text-primary font-bold">
									/join/8f4b7a1c9e2d
								</code>
								) that instantly adds members to your club roster.
							</p>
						)}
					</div>
				)}

				{/* Showcase Content */}
				{!isEditingSettings ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
						{/* About Info */}
						<div className="md:col-span-2 space-y-4">
							<h3 className="text-base font-bold text-text-primary">
								About the Club
							</h3>
							<p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
								{group.description}
							</p>

							{group.tags && group.tags.length > 0 && (
								<div className="pt-2">
									<h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
										Focus Areas &amp; Activities
									</h4>
									<div className="flex flex-wrap gap-1.5">
										{group.tags.map((t) => (
											<span
												key={t}
												className="bg-primary-light text-primary text-xs font-semibold px-2.5 py-1 rounded-lg"
											>
												#{t}
											</span>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Club Details Column */}
						<div className="space-y-4 rounded-xl bg-surface-secondary/40 p-4 border border-border">
							<h3 className="text-sm font-bold text-text-primary">
								Quick Facts
							</h3>
							<div className="space-y-3 text-xs">
								<div>
									<span className="text-text-muted block text-[10px] uppercase font-semibold">
										Visibility &amp; Access:
									</span>
									<span className="font-semibold text-text-primary mt-0.5 block">
										{group.isPrivate ? (
											<span className="text-warning font-semibold flex items-center gap-1">
												🔒 Private (Invite / Request Only)
											</span>
										) : (
											<span className="text-success font-semibold flex items-center gap-1">
												🌐 Public Organization
											</span>
										)}
									</span>
								</div>
								<div>
									<span className="text-text-muted block text-[10px] uppercase font-semibold">
										Meeting Schedule:
									</span>
									<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
										<FiCalendar className="text-primary" />{' '}
										{group.meetingFrequency}
									</span>
								</div>
								<div>
									<span className="text-text-muted block text-[10px] uppercase font-semibold">
										Meeting Room:
									</span>
									<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
										<FiMapPin className="text-primary" />{' '}
										{group.meetingLocation || 'Campus Center'}
									</span>
								</div>
								<div>
									<span className="text-text-muted block text-[10px] uppercase font-semibold">
										Category:
									</span>
									<span className="font-semibold text-text-primary mt-0.5">
										{group.category}
									</span>
								</div>
								{(group.discordUrl ||
									group.instagramUrl ||
									group.websiteUrl) && (
									<div className="pt-2 border-t border-border/60 space-y-2">
										<span className="text-text-muted block text-[10px] uppercase font-semibold mb-1">
											Social Links &amp; Web
										</span>
										{group.discordUrl && (
											<a
												href={group.discordUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="font-semibold text-primary hover:underline flex items-center gap-1.5 truncate"
											>
												<FaDiscord className="text-primary shrink-0" /> Discord
											</a>
										)}
										{group.instagramUrl && (
											<a
												href={group.instagramUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="font-semibold text-primary hover:underline flex items-center gap-1.5 truncate"
											>
												<FiInstagram className="text-primary shrink-0" /> Instagram
											</a>
										)}
										{group.websiteUrl && (
											<a
												href={group.websiteUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="font-semibold text-primary hover:underline flex items-center gap-1.5 truncate"
											>
												<FiGlobe className="text-primary shrink-0" /> Website
											</a>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				) : (
					/* Edit Club Profile Form */
					<form
						onSubmit={handleSaveClubSettings}
						className="space-y-4 text-xs border-t border-border pt-4"
					>
						{settingsSuccess && (
							<div className="text-xs text-success bg-success-bg p-2.5 rounded-lg text-center font-medium">
								Club settings updated successfully!
							</div>
						)}

						<Input
							label="Club Name"
							value={settingsName}
							onChange={(e) => setSettingsName(e.target.value)}
						/>

						<Input
							label="Tagline"
							value={settingsTagline}
							onChange={(e) => setSettingsTagline(e.target.value)}
						/>

						<Textarea
							label="Description & Mission"
							rows={4}
							value={settingsDesc}
							onChange={(e) => setSettingsDesc(e.target.value)}
						/>

						<Input
							label="Meeting Location"
							value={settingsLocation}
							onChange={(e) => setSettingsLocation(e.target.value)}
						/>

						{/* Privacy Setting */}
						<div className="rounded-xl border border-border bg-surface-secondary/40 p-4">
							<Checkbox
								id="setting-is-private-checkbox"
								checked={settingsIsPrivate}
								onChange={(e) =>
									setSettingsIsPrivate(e.target.checked)
								}
								label={
									<div className="ml-1">
										<span className="font-bold text-text-primary text-xs block">
											🔒 Private Club Hub (Disallow Non-Members &amp; Unauthorized Guests)
										</span>
										<span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
											When enabled, this club is hidden from public explore/search and disallowed from being viewed by guest visitors and unauthorized non-members. Only approved club members and officers can access the hub.
										</span>
									</div>
								}
							/>
						</div>

						{/* Banner Setting */}
						<div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
									Club Banner
								</span>
								<label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
									<Checkbox
										checked={settingsEnableCustomBanner}
										onChange={() =>
											setSettingsEnableCustomBanner(
												!settingsEnableCustomBanner,
											)
										}
									/>
									<span>Upload custom image</span>
								</label>
							</div>

							<div className="relative h-24 w-full rounded-lg overflow-hidden border border-border flex items-center justify-center">
								{settingsEnableCustomBanner && settingsBannerPreview ? (
									<>
										<Image
											src={settingsBannerPreview}
											alt="Banner Preview"
											fill
											unoptimized
											className="object-cover"
										/>
										<button
											type="button"
											onClick={() => setSettingsBannerPreview('')}
											className="absolute top-1 right-1 bg-black/60 text-white rounded px-2 py-0.5 text-[10px] cursor-pointer z-10"
										>
											Remove
										</button>
									</>
								) : (
									<div className="relative w-full h-full flex items-center justify-center">
										<ClubBanner
											bannerUrl={settingsBannerColor}
											alt={settingsName || 'Banner Preview'}
											category={group.category}
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-xs shadow-inner drop-shadow">
											{settingsName || 'Banner Preview'}
										</div>
									</div>
								)}
							</div>

							{settingsEnableCustomBanner ? (
								<div className="space-y-1.5">
									{fileSizeErrorSettings && (
										<div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-[11px] text-danger font-medium">
											<span className="shrink-0 mt-0.5">⚠️</span>
											<span>
												{fileSizeErrorSettings}{' '}
												<a
													href="https://joeyjazwinski.com/developer-tools/image-compressor"
													target="_blank"
													rel="noopener noreferrer"
													className="underline font-semibold hover:text-danger/80 transition-colors"
												>
													Compress here →
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
													setFileSizeErrorSettings(
														'Image is too large (max 200 KB).',
													);
													e.target.value = '';
													return;
												}
												setFileSizeErrorSettings('');
												const reader = new FileReader();
												reader.onload = () => {
													setSettingsBannerPreview(
														reader.result as string,
													);
												};
												reader.readAsDataURL(file);
											}
										}}
										className="block w-full text-xs text-text-secondary file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 cursor-pointer"
									/>
								</div>
							) : (
								<Select
									value={settingsBannerColor}
									onChange={(e) =>
										setSettingsBannerColor(e.target.value)
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

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<Input
								label="Discord URL"
								value={settingsDiscord}
								onChange={(e) => setSettingsDiscord(e.target.value)}
							/>
							<Input
								label="Instagram URL"
								value={settingsInstagram}
								onChange={(e) =>
									setSettingsInstagram(e.target.value)
								}
							/>
							<Input
								label="Website URL"
								value={settingsWebsite}
								onChange={(e) => setSettingsWebsite(e.target.value)}
							/>
						</div>

						<div className="pt-3 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setIsEditingSettings(false)}
								className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer hover:bg-surface-secondary transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={updatingSettings}
								className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50 cursor-pointer transition-all"
							>
								{updatingSettings ? 'Saving...' : 'Save Club Settings'}
							</button>
						</div>
					</form>
				)}
			</div>

			<ConfirmModal
				isOpen={showDeleteInviteModal}
				title="Delete All Invite Links"
				message="Are you sure you want to delete all invite links for this club? Existing codes, links, and QR codes will immediately stop working."
				confirmText="Delete Invite Links"
				isDestructive
				onConfirm={async () => {
					const res = await deleteClubInvites(group.id);
					if (res.success) {
						setGeneratedInviteCode('');
					}
					setShowDeleteInviteModal(false);
				}}
				onClose={() => setShowDeleteInviteModal(false)}
			/>
		</main>
	);
}
