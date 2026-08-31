'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppContext } from './AppContext';
import { useTutorial } from './tutorial/TutorialContext';
import ProfileMenu from './ProfileMenu';
import NotificationDrawer from './NotificationDrawer';
import { FiMenu, FiX, FiCompass, FiUsers, FiBell, FiCalendar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Nav() {
	const { currentUser, unreadNotificationCount, isTutorialMode } = useAppContext();
	const { openWelcomeModal } = useTutorial();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

	const navLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Explore Clubs', href: '/search', icon: FiCompass, tourId: 'nav-explore' },
		{ label: 'All Events', href: '/events', icon: FiCalendar, tourId: 'nav-events' },
		...(currentUser
			? [{ label: 'My Clubs', href: '/groups', icon: FiUsers, tourId: 'nav-groups' }]
			: []),
	];

	return (
		<>
			<nav className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-14 items-center justify-between">
						{/* Logo */}
						<Link
							href="/"
							className="flex items-center space-x-2"
							aria-label="Deimos home"
							data-tour="nav-brand"
						>
							<div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
								<Image
									src="/icon1.png"
									alt="Deimos Logo"
									fill
									className="object-cover dark:invert"
									priority
								/>
							</div>
							<div className="flex flex-col">
								<span className="text-lg font-extrabold tracking-tight text-primary leading-tight">
									Deimos
								</span>
								<span className="text-[9px] font-semibold text-text-muted uppercase tracking-widest -mt-1 hidden sm:block">
									Club Management
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
										data-tour={link.tourId}
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
						<div className="flex items-center space-x-2 sm:space-x-3">
							{/* Interactive Tour Launcher Button */}
							<button
								onClick={openWelcomeModal}
								aria-label="Launch interactive app tutorial"
								className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
									isTutorialMode
										? 'bg-primary text-white shadow-xs'
										: 'bg-primary/10 text-primary hover:bg-primary/20'
								}`}
							>
								<span className="text-xs">✨</span>
								<span>{isTutorialMode ? 'Tour Active' : 'App Tour'}</span>
							</button>

							{/* Notification Bell */}
							<button
								onClick={() =>
									setNotificationDrawerOpen(!notificationDrawerOpen)
								}
								aria-label="Open notifications"
								aria-expanded={notificationDrawerOpen}
								data-tour="nav-notifications"
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
							<div data-tour="nav-profile">
								<ProfileMenu />
							</div>
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
											data-tour={link.tourId}
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
									className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
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
								<button
									onClick={() => {
										setMobileMenuOpen(false);
										openWelcomeModal();
									}}
									className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
								>
									<span className="flex items-center gap-2 font-bold">
										✨ Guided App Tour
									</span>
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
