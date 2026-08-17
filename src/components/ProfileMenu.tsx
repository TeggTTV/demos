'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa';
import {
	FiUsers,
	FiInbox,
	FiLogOut,
	FiSun,
	FiMoon,
	FiUser,
	FiCompass,
} from 'react-icons/fi';
import { useAppContext } from './AppContext';
import Image from 'next/image';

export default function ProfileMenu() {
	const { currentUser, logoutUser, requests, groups, theme, toggleTheme } =
		useAppContext();

	const [profileOpen, setProfileOpen] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);

	/* ─── Pending badge count ─── */
	const ledGroupIds = groups
		.filter(
			(g) =>
				g.leaderId === currentUser?.id ||
				(g.officerIds && g.officerIds.includes(currentUser?.id || '')),
		)
		.map((g) => g.id);
	const pendingCount = requests.filter(
		(r) => ledGroupIds.includes(r.groupId) && r.status === 'PENDING',
	).length;

	/* ─── Click-outside to close ─── */
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				profileRef.current &&
				!profileRef.current.contains(e.target as Node)
			) {
				setProfileOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const logout = () => {
		logoutUser();
		setProfileOpen(false);
	};

	const isAuthenticated = !!currentUser;

	return (
		<div ref={profileRef} className="relative ml-1">
			<motion.div
				whileHover={{ scale: 1.05 }}
				whileFocus={{ scale: 0.95 }}
				whileTap={{ scale: 0.98 }}
				onClick={() => setProfileOpen(!profileOpen)}
				className="flex items-center space-x-2 cursor-pointer relative"
			>
				{currentUser?.avatarUrl ? (
					<div className="w-8 h-8 rounded-full overflow-hidden border border-border ring-2 ring-primary/20">
						<Image
							src={currentUser.avatarUrl}
							alt="Profile"
							className="w-full h-full object-cover"
							width={64}
							height={64}
						/>
					</div>
				) : (
					<FaUserCircle size={30} className="text-primary" />
				)}
				{/* Pending dot */}
				{pendingCount > 0 && (
					<span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
						<span className="relative inline-flex rounded-full h-3 w-3 bg-danger" />
					</span>
				)}
			</motion.div>

			<AnimatePresence>
				{profileOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.85, y: -4 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.85, y: -4 }}
						transition={{ duration: 0.18, ease: 'easeOut' }}
						className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl py-2 z-50 overflow-hidden"
					>
						{isAuthenticated ? (
							<>
								{/* Greeting */}
								<div className="px-4 py-3 border-b border-border bg-surface-secondary/50">
									<p className="text-sm font-semibold text-text-primary">
										Hi, {currentUser?.name || 'User'}!
									</p>
									<p className="text-xs text-text-muted mt-0.5">
										{currentUser?.email}
									</p>
									{currentUser?.major && (
										<span className="inline-block mt-1 text-[10px] font-medium bg-primary-light text-primary px-2 py-0.5 rounded-full">
											{currentUser.major}
										</span>
									)}
								</div>

								<div className="p-1.5">
									{/* Theme toggle */}
									{/* <button
										onClick={(e) => {
											e.stopPropagation();
											toggleTheme();
										}}
										className="flex w-full items-center gap-3 px-3 py-2 text-sm rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer"
									>
										{theme === 'light' ? (
											<FiMoon size={15} />
										) : (
											<FiSun size={15} />
										)}
										{theme === 'light'
											? 'Dark Mode'
											: 'Light Mode'}
									</button> */}

									<div className="h-px bg-border my-1" />

									{/* Edit Profile Link */}
									<Link
										href="/profile"
										onClick={() => setProfileOpen(false)}
										className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
									>
										<FiUser size={15} />
										Edit Profile
									</Link>

									{/* Explore Clubs */}
									<Link
										href="/search"
										onClick={() => setProfileOpen(false)}
										className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
									>
										<FiCompass size={15} />
										Explore Clubs
									</Link>

									{/* My Clubs Link */}
									<Link
										href="/groups"
										onClick={() => setProfileOpen(false)}
										className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
									>
										<FiUsers size={15} />
										My Clubs
									</Link>

									{/* Pending Requests */}
									<Link
										href="/pending"
										onClick={() => setProfileOpen(false)}
										className="flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
									>
										<span className="flex items-center gap-3">
											<FiInbox size={15} />
											Applications & Invites
										</span>
										{pendingCount > 0 && (
											<span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold px-1.5">
												{pendingCount}
											</span>
										)}
									</Link>

									<div className="h-px bg-border my-1" />

									{/* Logout */}
									<button
										onClick={logout}
										className="flex w-full items-center gap-3 cursor-pointer px-3 py-2 text-sm text-danger hover:bg-danger-bg rounded-lg transition-colors"
									>
										<FiLogOut size={15} />
										Sign Out
									</button>
								</div>
							</>
						) : (
							<>
								<div className="px-4 py-2 text-sm text-text-muted border-b border-border mb-1">
									Welcome to Demos!
								</div>
								<div className="p-1.5">
									<Link
										href="/auth/login"
										onClick={() => setProfileOpen(false)}
										className="flex w-full items-center gap-3 px-3 py-2 text-sm rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
									>
										Sign In
									</Link>
									<Link
										href="/auth/register"
										onClick={() => setProfileOpen(false)}
										className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-light rounded-lg transition-colors"
									>
										Create Account
									</Link>
								</div>
							</>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
