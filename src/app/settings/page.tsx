'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
	NotificationType,
	NOTIFICATION_CONFIG_MAP,
	requestNotificationPermission,
	playNotificationSound,
	sendBrowserNotification,
} from '@/utils/notificationUtils';
import {
	FiBell,
	FiSmartphone,
	FiVolume2,
	FiCheck,
	FiDownload,
	FiTrash2,
	FiSend,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const NOTIFICATION_KEYS: NotificationType[] = [
	'feed_message',
	'feed_attachment',
	'feed_link',
	'join_request',
	'join_request_status',
	'invite_used',
	'member_added',
	'member_promoted',
	'member_demoted',
	'member_removed',
	'attendance_opened',
	'attendance_closed',
	'attendance_status',
];

export default function SettingsPage() {
	const {
		notificationSettings,
		updateNotificationSettings,
		clearAllNotifications,
		triggerNotification,
		hydrated,
	} = useAppContext();

	const [permissionStatus, setPermissionStatus] =
		useState<NotificationPermission>('default');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [isInstalled, setIsInstalled] = useState(false);
	const [testSent, setTestSent] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Detect PWA install state and install prompt
	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (typeof window !== 'undefined') {
			if ('Notification' in window) {
				setPermissionStatus(Notification.permission);
			}

			// Check standalone mode
			if (
				window.matchMedia('(display-mode: standalone)').matches ||
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window.navigator as any).standalone === true
			) {
				setIsInstalled(true);
			}

			// Listen for beforeinstallprompt
			const handleBeforeInstallPrompt = (e: Event) => {
				e.preventDefault();
				setDeferredPrompt(e);
			};

			window.addEventListener(
				'beforeinstallprompt',
				handleBeforeInstallPrompt,
			);
			return () =>
				window.removeEventListener(
					'beforeinstallprompt',
					handleBeforeInstallPrompt,
				);
		}
	}, []);
	/* eslint-enable react-hooks/set-state-in-effect */

	const handleRequestPermission = async () => {
		const permission = await requestNotificationPermission();
		setPermissionStatus(permission);
		if (permission === 'granted') {
			updateNotificationSettings({ browserPushEnabled: true });
			sendBrowserNotification(
				'Notifications Enabled',
				'You will now receive Demos updates on your device.',
			);
		}
	};

	const handleInstallApp = async () => {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === 'accepted') {
				setIsInstalled(true);
			}
			setDeferredPrompt(null);
		}
	};

	const handleSendTestNotification = () => {
		triggerNotification({
			type: 'feed_message',
			title: 'Demos Notification Test',
			body: 'Your notification system is fully working!',
			url: '/settings',
		});
		setTestSent(true);
		setTimeout(() => setTestSent(false), 3000);
	};

	const handleToggleKey = (key: NotificationType) => {
		const nextVal = !notificationSettings[key];
		updateNotificationSettings({ [key]: nextVal });
		setSaveSuccess(true);
		setTimeout(() => setSaveSuccess(false), 2000);
	};

	if (!hydrated) return null;

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
				<div className="space-y-8">
					{/* Header */}
					<div>
						<h1 className="text-2xl font-bold text-text-primary">
							Settings
						</h1>
						<p className="text-xs text-text-muted mt-1">
							Manage app installation, push permissions, and choose which
							notifications you want to receive.
						</p>
					</div>

					{/* Section 1: Progressive Web App (PWA) */}
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
									<FiSmartphone size={20} />
								</div>
								<div>
									<h2 className="text-sm font-bold text-text-primary">
										Progressive Web App
									</h2>
									<p className="text-xs text-text-muted">
										Install Demos to your home screen or desktop for fast
										access and native alerts.
									</p>
								</div>
							</div>

							<div>
								{isInstalled ? (
									<span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg border border-success/20 px-3 py-1 text-xs font-semibold text-success">
										<FiCheck size={14} /> Installed
									</span>
								) : deferredPrompt ? (
									<button
										onClick={handleInstallApp}
										className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors shadow-xs cursor-pointer"
									>
										<FiDownload size={14} /> Install App
									</button>
								) : (
									<span className="text-xs text-text-muted bg-surface-secondary px-3 py-1.5 rounded-lg border border-border">
										PWA Ready
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Section 2: Browser & System Push */}
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
									<FiBell size={20} />
								</div>
								<div>
									<h2 className="text-sm font-bold text-text-primary">
										Device Push Notifications
									</h2>
									<p className="text-xs text-text-muted">
										Receive background system alerts even when the browser
										tab is closed.
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{permissionStatus === 'granted' ? (
									<span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg border border-success/20 px-3 py-1 text-xs font-semibold text-success">
										<FiCheck size={14} /> Granted
									</span>
								) : permissionStatus === 'denied' ? (
									<span className="text-xs text-danger bg-danger-bg border border-danger/20 px-3 py-1 rounded-full font-semibold">
										Blocked in Browser
									</span>
								) : (
									<button
										onClick={handleRequestPermission}
										className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors shadow-xs cursor-pointer"
									>
										Enable Permissions
									</button>
								)}

								<button
									onClick={handleSendTestNotification}
									className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-secondary px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
								>
									<FiSend size={13} />
									{testSent ? 'Sent!' : 'Send Test'}
								</button>
							</div>
						</div>

						<div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
							{/* Sound toggle */}
							<label className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/60 border border-border cursor-pointer hover:bg-surface-secondary transition-colors">
								<span className="flex items-center gap-2 font-medium text-text-primary">
									<FiVolume2 size={15} className="text-text-secondary" />
									Notification Sound
								</span>
								<input
									type="checkbox"
									checked={notificationSettings.soundEnabled}
									onChange={(e) => {
										updateNotificationSettings({
											soundEnabled: e.target.checked,
										});
										if (e.target.checked) playNotificationSound();
									}}
									className="h-4 w-4 rounded accent-primary cursor-pointer"
								/>
							</label>

							{/* Browser push toggle */}
							<label className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/60 border border-border cursor-pointer hover:bg-surface-secondary transition-colors">
								<span className="flex items-center gap-2 font-medium text-text-primary">
									<FiBell size={15} className="text-text-secondary" />
									Browser System Popups
								</span>
								<input
									type="checkbox"
									checked={notificationSettings.browserPushEnabled}
									onChange={(e) => {
										if (
											e.target.checked &&
											permissionStatus !== 'granted'
										) {
											handleRequestPermission();
										} else {
											updateNotificationSettings({
												browserPushEnabled: e.target.checked,
											});
										}
									}}
									className="h-4 w-4 rounded accent-primary cursor-pointer"
								/>
							</label>
						</div>
					</div>

					{/* Section 3: Notification Toggles */}
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-sm font-bold text-text-primary">
									Notifications
								</h2>
								<p className="text-xs text-text-muted mt-0.5">
									Toggle individual alerts on or off.
								</p>
							</div>
							{saveSuccess && (
								<motion.span
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-xs font-semibold text-success bg-success-bg border border-success/20 px-2.5 py-1 rounded-lg"
								>
									Preferences updated!
								</motion.span>
							)}
						</div>

						<div className="divide-y divide-border/60">
							{NOTIFICATION_KEYS.map((key) => {
								const meta = NOTIFICATION_CONFIG_MAP[key];
								const isChecked = notificationSettings[key] !== false;

								return (
									<div
										key={key}
										className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1"
									>
										<div className="flex items-center gap-3">
											<span className="text-lg">{meta.icon}</span>
											<div>
												<span className="text-xs font-semibold text-text-primary block">
													{meta.label}
												</span>
												<span className="text-[11px] text-text-muted block">
													{meta.description}
												</span>
											</div>
										</div>

										<button
											type="button"
											role="switch"
											aria-checked={isChecked}
											onClick={() => handleToggleKey(key)}
											className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
												isChecked
													? 'bg-primary'
													: 'bg-surface-tertiary border-border'
											}`}
										>
											<span
												className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
													isChecked
														? 'translate-x-5'
														: 'translate-x-0'
												}`}
											/>
										</button>
									</div>
								);
							})}
						</div>
					</div>

					{/* Section 4: History & Data Management */}
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex items-center justify-between">
						<div>
							<h3 className="text-xs font-bold text-text-primary">
								Clear Notification History
							</h3>
							<p className="text-[11px] text-text-muted mt-0.5">
								Remove all saved in-app notifications from this device.
							</p>
						</div>
						<button
							onClick={() => {
								if (
									confirm(
										'Are you sure you want to clear all notification history?',
									)
								) {
									clearAllNotifications();
								}
							}}
							className="inline-flex items-center gap-1.5 rounded-xl border border-danger/20 bg-danger-bg px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors cursor-pointer"
						>
							<FiTrash2 size={13} />
							Clear All
						</button>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
