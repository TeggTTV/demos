'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppContext } from './AppContext';
import ProfileMenu from './ProfileMenu';
import { FiMenu, FiX, FiCompass, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Nav() {
	const { currentUser } = useAppContext();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Explore Clubs', href: '/search', icon: FiCompass },
		...(currentUser
			? [{ label: 'My Clubs', href: '/groups', icon: FiUsers }]
			: []),
	];

	return (
		<nav className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-14 items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
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
					<div className="hidden md:flex items-center space-x-1">
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
								>
									{link.label}
								</Link>
							);
						})}
					</div>

					{/* Right Section */}
					<div className="flex items-center space-x-3">
						{/* Profile Menu */}
						<ProfileMenu />

						{/* Mobile Menu Toggle */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden p-1.5 rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus:outline-none"
							aria-label="Toggle menu"
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
									>
										{link.label}
									</Link>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
}
