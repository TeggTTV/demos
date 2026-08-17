'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiX,
	FiCheckCircle,
	FiTrash2,
	FiSettings,
	FiExternalLink,
	FiInbox,
} from 'react-icons/fi';
import { useAppContext } from './AppContext';
import { NOTIFICATION_CONFIG_MAP } from '@/utils/notificationUtils';
import Link from 'next/link';

interface NotificationDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function NotificationDrawer({
	isOpen,
	onClose,
}: NotificationDrawerProps) {
	const {
		notifications,
		unreadNotificationCount,
		markNotificationAsRead,
		markAllNotificationsAsRead,
		deleteNotification,
		clearAllNotifications,
	} = useAppContext();

	const drawerRef = useRef<HTMLDivElement>(null);

	// Close on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	// Prevent background scroll when drawer is open
	useEffect(() => {
		if (isOpen) {
			document.body.classList.add('modal-open');
		} else {
			document.body.classList.remove('modal-open');
		}
		return () => document.body.classList.remove('modal-open');
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
					/>

					{/* Slide-in Drawer */}
					<motion.div
						ref={drawerRef}
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 280 }}
						className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-surface border-l border-border shadow-2xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between border-b border-border px-5 py-4">
							<div className="flex items-center gap-2.5">
								<h2 className="text-base font-bold text-text-primary">
									Notifications
								</h2>
								{unreadNotificationCount > 0 && (
									<span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
										{unreadNotificationCount} new
									</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								<Link
									href="/settings"
									onClick={onClose}
									className="rounded-lg p-2 text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
									title="Notification Settings"
								>
									<FiSettings size={18} />
								</Link>
								<button
									onClick={onClose}
									className="rounded-lg p-2 text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors cursor-pointer"
								>
									<FiX size={20} />
								</button>
							</div>
						</div>

						{/* Action toolbar */}
						{notifications.length > 0 && (
							<div className="flex items-center justify-between border-b border-border bg-surface-secondary/50 px-5 py-2 text-xs">
								<button
									onClick={markAllNotificationsAsRead}
									className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline cursor-pointer"
								>
									<FiCheckCircle size={13} />
									Mark all as read
								</button>
								<button
									onClick={clearAllNotifications}
									className="inline-flex items-center gap-1.5 font-medium text-text-muted hover:text-danger cursor-pointer transition-colors"
								>
									<FiTrash2 size={13} />
									Clear all
								</button>
							</div>
						)}

						{/* Notification List */}
						<div className="flex-1 overflow-y-auto divide-y divide-border/60">
							{notifications.length === 0 ? (
								<div className="flex h-full flex-col items-center justify-center p-8 text-center">
									<div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-secondary text-text-muted mb-3">
										<FiInbox size={26} />
									</div>
									<p className="text-sm font-semibold text-text-primary">
										All caught up!
									</p>
									<p className="text-xs text-text-muted mt-1 max-w-xs">
										You will receive real-time alerts for club messages,
										attendance sessions, and membership updates.
									</p>
								</div>
							) : (
								notifications.map((item) => {
									const meta = NOTIFICATION_CONFIG_MAP[item.type] || {
										icon: '🔔',
										label: 'Update',
									};

									return (
										<div
											key={item.id}
											onClick={() => markNotificationAsRead(item.id)}
											className={`group relative p-4 transition-colors hover:bg-surface-secondary/70 ${
												!item.read
													? 'bg-primary-light/30 dark:bg-primary-light/10'
													: 'bg-surface'
											}`}
										>
											<div className="flex items-start gap-3">
												{/* Icon */}
												<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-secondary border border-border text-lg shadow-2xs">
													{meta.icon}
												</div>

												{/* Content */}
												<div className="flex-1 min-w-0 pr-6">
													<div className="flex items-center gap-2">
														<span className="text-xs font-bold text-text-primary truncate">
															{item.title}
														</span>
														{!item.read && (
															<span className="h-2 w-2 rounded-full bg-primary shrink-0" />
														)}
													</div>
													<p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
														{item.body}
													</p>
													<div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
														<span>
															{new Date(
																item.createdAt,
															).toLocaleTimeString([], {
																hour: '2-digit',
																minute: '2-digit',
															})}
														</span>
														{item.groupName && (
															<span className="truncate font-medium text-primary">
																{item.groupName}
															</span>
														)}
													</div>
												</div>

												{/* Quick Actions */}
												<div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													{item.url && (
														<Link
															href={item.url}
															onClick={() => {
																markNotificationAsRead(item.id);
																onClose();
															}}
															className="p-1.5 text-text-muted hover:text-primary transition-colors"
															title="View update"
														>
															<FiExternalLink size={14} />
														</Link>
													)}
													<button
														onClick={(e) => {
															e.stopPropagation();
															deleteNotification(item.id);
														}}
														className="p-1.5 text-text-muted hover:text-danger transition-colors cursor-pointer"
														title="Delete"
													>
														<FiTrash2 size={14} />
													</button>
												</div>
											</div>
										</div>
									);
								})
							)}
						</div>

						{/* Footer */}
						<div className="border-t border-border p-3 text-center bg-surface">
							<Link
								href="/settings"
								onClick={onClose}
								className="text-xs text-primary font-semibold hover:underline"
							>
								Configure Notification Settings →
							</Link>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
