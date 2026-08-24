'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppContext } from './AppContext';
import ProfileMenu from './ProfileMenu';
import NotificationDrawer from './NotificationDrawer';
import { FiMenu, FiX, FiCompass, FiUsers, FiBell, FiCalendar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Nav() {
	const { currentUser, unreadNotificationCount } = useAppContext();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

	const navLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Explore Clubs', href: '/search', icon: FiCompass },
		{ label: 'All Events', href: '/events', icon: FiCalendar },
		...(currentUser
			? [{ label: 'My Clubs', href: '/groups', icon: FiUsers }]
			: []),
	];

	return (
		<>
			<nav className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-14 items-center justify-between">
						{/* Logo */}
						<Link href="/" className="flex items-center space-x-2" aria-label="Demos home">
							<div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
								<Image
									src="/icon1.png"
									alt="Demos Logo"
									fill
									className="object-cover dark:invert"
									priority
								/>
							</div>
							<div className="flex flex-col">
								<span className="text-lg font-extrabold tracking-tight text-primary leading-tight">
									Demos
								</span>
								<span className="text-[9px] font-semibold text-text-muted uppercase tracking-widest -mt-1 hidden sm:block">
									Club Hub
								</span>
							</div>
						</Link>

						{/* Center Nav (Desktop) */}
						<div className="hidden md:flex items-center space-x-1" aria-label="Primary navigation">
							{navLinks.map((link) => {
								const active = pathname === link.href;
								return (
									<Link
										key={link.href}
										href={link.href}
									className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
											active
												? 'bg-primary-light text-primary font-semibold'
												: 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
									}`}
									aria-current={active ? 'page' : undefined}
									>
										{link.label}
									</Link>
								);
							})}
						</div>

						{/* Right Section */}
						<div className="flex items-center space-x-3">
							{/* Notification Bell */}
							<button
								onClick={() =>
									setNotificationDrawerOpen(!notificationDrawerOpen)
								}
								aria-label="Open notifications"
								aria-expanded={notificationDrawerOpen}
								className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
							>
								<FiBell size={20} />
								{unreadNotificationCount > 0 && (
									<span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-xs">
										{unreadNotificationCount > 9
											? '9+'
											: unreadNotificationCount}
									</span>
								)}
							</button>

							{/* Profile Menu */}
							<ProfileMenu />
							{!currentUser && (
								<Link
									href="/auth/register"
									className="hidden rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:inline-flex"
								>
									Get started
								</Link>
							)}

							{/* Mobile Menu Toggle */}
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="md:hidden p-1.5 rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
								aria-label="Toggle menu"
								aria-expanded={mobileMenuOpen}
								aria-controls="mobile-navigation"
							>
								{mobileMenuOpen ? (
									<FiX size={20} />
								) : (
									<FiMenu size={20} />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Nav Collapse Menu */}
				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							className="md:hidden border-t border-border bg-surface overflow-hidden"
							id="mobile-navigation"
						>
							<div className="px-4 py-3 space-y-1.5">
								{navLinks.map((link) => {
									const active = pathname === link.href;
									return (
										<Link
											key={link.href}
											href={link.href}
											onClick={() => setMobileMenuOpen(false)}
										className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												active
													? 'bg-primary-light text-primary font-semibold'
													: 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
										}`}
										aria-current={active ? 'page' : undefined}
										>
											{link.label}
										</Link>
									);
								})}
								<button
									onClick={() => {
										setMobileMenuOpen(false);
										setNotificationDrawerOpen(true);
									}}
									className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
								>
									<span className="flex items-center gap-2">
										<FiBell size={16} /> Notifications
									</span>
									{unreadNotificationCount > 0 && (
										<span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
											{unreadNotificationCount}
										</span>
									)}
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>

			{/* Slide-out Notifications Drawer */}
			<NotificationDrawer
				isOpen={notificationDrawerOpen}
				onClose={() => setNotificationDrawerOpen(false)}
			/>
		</>
	);
}
