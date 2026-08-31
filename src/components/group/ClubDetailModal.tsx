'use client';

import React from 'react';
import Link from 'next/link';
import {
	FiCalendar,
	FiMapPin,
	FiGlobe,
	FiInstagram,
	FiCheck,
	FiSend,
	FiTag,
} from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { Textarea } from '@/components/ui/Textarea';
import { Group, User, JoinRequest } from '@/types/models';
import ClubBanner from '@/components/ui/ClubBanner';
import { useAppContext } from '@/components/AppContext';
import { MOCK_USERS } from '@/mock/mockData';

interface ClubDetailModalProps {
	club: Group | null;
	onClose: () => void;
	currentUser: User | null;
	requests: JoinRequest[];
	joinMessage: string;
	setJoinMessage: (msg: string) => void;
	joinSuccess: boolean;
	joinError?: string;
	isSubmitting?: boolean;
	onRequestJoin: (groupId: string) => Promise<void>;
}

export default function ClubDetailModal({
	club,
	onClose,
	currentUser,
	requests,
	joinMessage,
	setJoinMessage,
	joinSuccess,
	joinError,
	isSubmitting = false,
	onRequestJoin,
}: ClubDetailModalProps) {
	const { isTutorialMode } = useAppContext();
	if (!club) return null;

	const effectiveUser = currentUser || (isTutorialMode ? MOCK_USERS[0] : null);

	const isMember =
		effectiveUser &&
		(club.memberIds.includes(effectiveUser.id) ||
			club.leaderId === effectiveUser.id ||
			(isTutorialMode && club.id === 'club_acm_01'));

	const hasRequested =
		effectiveUser &&
		requests.some(
			(r) =>
				r.groupId === club.id &&
				r.userId === effectiveUser.id &&
				r.status === 'PENDING',
		);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
			<div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-8">
				{/* Modal Banner */}
				<div className="h-44 w-full relative bg-surface-secondary overflow-hidden">
					<ClubBanner
						bannerUrl={club.bannerUrl}
						alt={club.name}
						category={club.category}
						className="object-cover"
					/>
					<button
						onClick={onClose}
						className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer z-10"
					>
						✕
					</button>
					<div className="absolute bottom-3 left-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary border border-border shadow-xs">
						{club.category}
					</div>
				</div>

				<div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
					{/* Header */}
					<div>
						<h2 className="text-2xl font-extrabold text-text-primary">
							{club.name}
						</h2>
						{club.tagline && (
							<p className="text-sm font-medium text-text-secondary mt-1">
								{club.tagline}
							</p>
						)}
					</div>

					{/* Description */}
					<div className="space-y-1">
						<h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
							About the Club
						</h4>
						<p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
							{club.description}
						</p>
					</div>

					{/* Tags */}
					{club.tags && club.tags.length > 0 && (
						<div className="space-y-1.5">
							<h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
								Focus Areas &amp; Perks
							</h4>
							<div className="flex flex-wrap gap-1.5">
								{club.tags.map((t) => (
									<span
										key={t}
										className="inline-flex items-center gap-1 text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-lg"
									>
										<FiTag size={10} /> {t}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Meeting Schedule & Location Box */}
					<div className="rounded-xl border border-border bg-surface-secondary/50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
						<div>
							<span className="text-text-muted font-medium block">
								Meeting Schedule:
							</span>
							<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
								<FiCalendar className="text-primary" />{' '}
								{club.meetingFrequency}
							</span>
						</div>
						<div>
							<span className="text-text-muted font-medium block">
								Location / Room:
							</span>
							<span className="font-semibold text-text-primary mt-0.5 flex items-center gap-1.5">
								<FiMapPin className="text-primary" />{' '}
								{club.meetingLocation || 'Campus Center'}
							</span>
						</div>
					</div>

					{/* Social Media & External Links */}
					{(club.websiteUrl ||
						club.instagramUrl ||
						club.discordUrl) && (
						<div className="space-y-1.5">
							<h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
								Connect with Us
							</h4>
							<div className="flex flex-wrap gap-2">
								{club.websiteUrl && (
									<a
										href={club.websiteUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
									>
										<FiGlobe size={13} /> Website
									</a>
								)}
								{club.instagramUrl && (
									<a
										href={club.instagramUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-pink-600 transition-colors"
									>
										<FiInstagram size={13} /> Instagram
									</a>
								)}
								{club.discordUrl && (
									<a
										href={club.discordUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-indigo-500 transition-colors"
									>
										<FaDiscord size={13} /> Discord
									</a>
								)}
							</div>
						</div>
					)}

					{/* Join / Action Box */}
					<div className="pt-3 border-t border-border">
						{!effectiveUser && !isTutorialMode ? (
							<div className="rounded-xl border border-primary/20 bg-primary-light/40 p-4 text-center space-y-2">
								<p className="text-xs font-semibold text-text-primary">
									Want to join or connect with {club.name}?
								</p>
								<p className="text-[11px] text-text-muted">
									Sign in or register with your campus email to apply for membership, chat in club management, and participate in events.
								</p>
								<div className="pt-1 flex items-center justify-center gap-2">
									<Link
										href="/auth/login"
										className="rounded-lg bg-surface border border-border px-3.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary transition-colors"
									>
										Log In
									</Link>
									<Link
										href="/auth/register"
										className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors shadow-2xs"
									>
										Create Account
									</Link>
								</div>
							</div>
						) : isMember ? (
							<div className="flex items-center justify-between p-4 rounded-xl bg-success-bg border border-success/20">
								<span className="text-xs font-semibold text-success flex items-center gap-1.5">
									<FiCheck /> You are an active member of this club!
								</span>
								<Link
									href={`/group/${club.id}/feed`}
									onClick={onClose}
									className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all"
								>
									Open Club Management
								</Link>
							</div>
						) : hasRequested ? (
							<div className="p-4 rounded-xl bg-warning-bg border border-warning/20 text-center">
								<p className="text-xs font-semibold text-warning">
									Your application has been submitted and is pending review by club officers.
								</p>
							</div>
						) : (
							<div className="space-y-3">
								<label className="block text-xs font-bold text-text-primary">
									Apply to Join {club.name}
								</label>
								<Textarea
									rows={2}
									placeholder="Introduce yourself (major, graduation year, or what you hope to learn)..."
									value={joinMessage}
									onChange={(e) => setJoinMessage(e.target.value)}
								/>
								{joinSuccess && (
									<div className="text-xs text-success bg-success-bg border border-success/20 p-2.5 rounded-lg text-center font-medium">
										Application submitted successfully!
									</div>
								)}
								{joinError && (
									<div className="text-xs text-danger bg-danger-bg border border-danger/20 p-2.5 rounded-lg text-center font-medium">
										{joinError}
									</div>
								)}
								<button
									disabled={isSubmitting}
									onClick={() => onRequestJoin(club.id)}
									className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
								>
									{isSubmitting ? (
										<span>Submitting application...</span>
									) : (
										<>
											<FiSend size={14} /> Submit Application
										</>
									)}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
