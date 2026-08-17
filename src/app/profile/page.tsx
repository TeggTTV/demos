'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { compressImage } from '@/utils/imageCompression';

export default function ProfilePage() {
	const { currentUser, updateProfile, hydrated } = useAppContext();
	const [name, setName] = useState('');
	const [avatarUrl, setAvatarUrl] = useState('');
	const [bio, setBio] = useState('');
	const [major, setMajor] = useState('');
	const [year, setYear] = useState('');
	const [success, setSuccess] = useState(false);

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (currentUser) {
			setName(currentUser.name || '');
			setAvatarUrl(currentUser.avatarUrl || '');
			setBio(currentUser.bio || '');
			setMajor(currentUser.major || '');
			setYear(currentUser.year || '');
		}
	}, [currentUser]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateProfile(name, avatarUrl, bio, major, year);
		setSuccess(true);
		setTimeout(() => setSuccess(false), 3000);
	};

	if (!hydrated) return null;

	if (!currentUser) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<Nav />
				<main className="grow flex items-center justify-center p-6 text-center">
					<p className="text-text-muted text-sm">
						Please sign in to edit your profile.
					</p>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />
			<main className="flex-1 mx-auto w-full max-w-xl px-4 sm:px-6 lg:px-8 py-10">
				<div className="rounded-2xl border border-border bg-surface p-8 shadow-sm space-y-6">
					<div>
						<h1 className="text-2xl font-bold text-text-primary">
							Student Profile
						</h1>
						<p className="text-xs text-text-muted mt-1">
							Update your name, major, graduation year, bio, and avatar.
							This info is visible on club rosters and applications.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4 text-xs">
						{/* Avatar Preview */}
						<div className="flex items-center space-x-4">
							{avatarUrl ? (
								<Image
									src={avatarUrl}
									alt="Profile Preview"
									className="h-16 w-16 rounded-full object-cover border border-border ring-2 ring-primary/20"
									width={64}
									height={64}
									unoptimized
								/>
							) : (
								<div className="h-16 w-16 rounded-full bg-primary-light text-primary flex items-center justify-center text-xl font-bold">
									{name[0] || 'U'}
								</div>
							)}
							<div className="text-xs text-text-muted">
								<span className="font-semibold text-text-primary block">
									{name || 'Your Name'}
								</span>
								<span>{currentUser.email}</span>
							</div>
						</div>

						<Input
							type="text"
							label="Display Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input
								type="text"
								label="Major / Program"
								value={major}
								onChange={(e) => setMajor(e.target.value)}
							/>
							<Input
								type="text"
								label="Class / Year"
								value={year}
								onChange={(e) => setYear(e.target.value)}
							/>
						</div>

						<div>
							<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
								Bio &amp; Interests
							</label>
							<textarea
								rows={3}
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
							/>
						</div>

						{/* File upload */}
						<div className="space-y-1.5 pt-2">
							<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider">
								Upload Profile Avatar
							</label>
							<input
								type="file"
								accept="image/*"
								onChange={async (e) => {
									const file = e.target.files?.[0];
									if (file) {
										try {
											const compressedDataUrl = await compressImage(file);
											setAvatarUrl(compressedDataUrl);
										} catch (err) {
											console.error('Image compression failed:', err);
										}
									}
								}}
								className="block w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 cursor-pointer"
							/>
						</div>

						{success && (
							<motion.div
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-xs text-success bg-success-bg border border-success/20 p-3 rounded-lg text-center font-semibold"
							>
								Profile saved successfully!
							</motion.div>
						)}

						<button
							type="submit"
							className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
						>
							Save Profile Changes
						</button>
					</form>
				</div>
			</main>
			<Footer />
		</div>
	);
}
