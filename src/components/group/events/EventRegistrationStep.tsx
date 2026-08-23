'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

interface EventRegistrationStepProps {
	activityMembersOnly: boolean;
	setActivityMembersOnly?: (val: boolean) => void;
	activityRegRequired: boolean;
	setActivityRegRequired: (val: boolean) => void;
	activityRegCapacity: string;
	setActivityRegCapacity: (val: string) => void;
	activityRegDeadline: string;
	setActivityRegDeadline: (val: string) => void;
}

export default function EventRegistrationStep({
	activityMembersOnly,
	setActivityMembersOnly,
	activityRegRequired,
	setActivityRegRequired,
	activityRegCapacity,
	setActivityRegCapacity,
	activityRegDeadline,
	setActivityRegDeadline,
}: EventRegistrationStepProps) {
	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			{/* Members-Only Requirement Toggle */}
			<div className="p-3.5 rounded-xl border border-primary/20 bg-primary-light/30 space-y-2">
				<div className="flex items-center gap-2.5">
					<Checkbox
						id="members-only-checkbox"
						checked={activityMembersOnly}
						onChange={(e) =>
							setActivityMembersOnly &&
							setActivityMembersOnly(e.target.checked)
						}
					/>
					<label
						htmlFor="members-only-checkbox"
						className="text-xs font-bold text-text-primary cursor-pointer select-none"
					>
						🔒 Members-Only Activity
					</label>
				</div>
				<p className="text-[11px] text-text-secondary pl-6">
					When enabled, only registered club members and officers can RSVP to this event. Non-members will be prompted to view and join the club.
				</p>
			</div>

			<div className="flex items-center gap-2 py-1">
				<Checkbox
					id="reg-required-checkbox"
					checked={activityRegRequired}
					onChange={(e) => setActivityRegRequired(e.target.checked)}
				/>
				<label
					htmlFor="reg-required-checkbox"
					className="text-xs font-semibold text-text-secondary cursor-pointer select-none"
				>
					Require registration to attend
				</label>
			</div>

			{activityRegRequired && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{
						opacity: 1,
						height: 'auto',
					}}
					className="space-y-4 pt-1"
				>
					<Input
						label="Max Capacity (Optional)"
						type="number"
						placeholder="Leave empty for unlimited"
						value={activityRegCapacity}
						onChange={(e) => setActivityRegCapacity(e.target.value)}
					/>

					<div>
						<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
							Registration Deadline (Optional)
						</label>
						<input
							type="datetime-local"
							value={activityRegDeadline}
							onChange={(e) =>
								setActivityRegDeadline(e.target.value)
							}
							className="w-full rounded-xl border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
						/>
					</div>
				</motion.div>
			)}
		</div>
	);
}
