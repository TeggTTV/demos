'use client';

import React from 'react';
import Image from 'next/image';
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
import { DEFAULT_CLUB_BANNER } from '@/constants/bannerPresets';

interface ClubDetailModalProps {
	club: Group | null;
	onClose: () => void;
	currentUser: User | null;
	requests: JoinRequest[];
	joinMessage: string;
	setJoinMessage: (msg: string) => void;
	joinSuccess: boolean;
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
	onRequestJoin,
}: ClubDetailModalProps) {
	if (!club) return null;

	const isMember =
		currentUser &&
		(club.memberIds.includes(currentUser.id) ||
			club.leaderId === currentUser.id);

	const hasRequested =
		currentUser &&
		requests.some(
			(r) =>
				r.groupId === club.id &&
				r.userId === currentUser.id &&
				r.status === 'PENDING',
		);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
			<div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-8">
				{/* Modal Banner */}
				<div className="h-44 w-full relative bg-surface-secondary overflow-hidden">
					{club.bannerUrl?.startsWith('data:') ||
					club.bannerUrl?.startsWith('http') ? (
						<Image
							src={club.bannerUrl}
							alt={club.name}
							fill
							className="object-cover"
						/>
					) : (
						<div
							className="w-full h-full"
							style={{
								background:
									club.bannerUrl || DEFAULT_CLUB_BANNER,
							}}
						/>
					)}
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
						{isMember ? (
							<div className="flex items-center justify-between p-4 rounded-xl bg-success-bg border border-success/20">
								<span className="text-xs font-semibold text-success flex items-center gap-1.5">
									<FiCheck /> You are an active member of this club!
								</span>
								<Link
									href={`/group/${club.id}/feed`}
									className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all"
								>
									Open Club Hub
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
									<div className="text-xs text-success bg-success-bg p-2 rounded-lg text-center font-medium">
										Application submitted successfully!
									</div>
								)}
								<button
									onClick={() => onRequestJoin(club.id)}
									className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
								>
									<FiSend size={14} /> Submit Application
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
