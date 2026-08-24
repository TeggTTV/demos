import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheckCircle } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

interface EventBasicDetailsStepProps {
	eventTitle: string;
	setEventTitle: (val: string) => void;
	eventDate: string;
	setEventDate: (val: string) => void;
	eventTime: string;
	setEventTime: (val: string) => void;
	eventLocation: string;
	setEventLocation: (val: string) => void;
	activityEndDate: string;
	setActivityEndDate: (val: string) => void;
	activityEndTime: string;
	setActivityEndTime: (val: string) => void;
	activityAllDay: boolean;
	setActivityAllDay: (val: boolean) => void;
	activityLocationType: string;
	setActivityLocationType: (val: string) => void;
	activityStatus?: string;
	setActivityStatus?: (val: string) => void;
	eventDesc: string;
	setEventDesc: (val: string) => void;
}

export default function EventBasicDetailsStep({
	eventTitle,
	setEventTitle,
	eventDate,
	setEventDate,
	eventTime,
	setEventTime,
	eventLocation,
	setEventLocation,
	activityEndDate,
	setActivityEndDate,
	activityEndTime,
	setActivityEndTime,
	activityAllDay,
	setActivityAllDay,
	activityLocationType,
	setActivityLocationType,
	eventDesc,
	setEventDesc,
}: EventBasicDetailsStepProps) {
	const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);

	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			<Input
				label="Title"
				required
				placeholder="e.g. Workshop Advanced Agentic Coding"
				value={eventTitle}
				onChange={(e) => setEventTitle(e.target.value)}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<Input
					label="Date"
					type="date"
					required
					value={eventDate}
					onChange={(e) => setEventDate(e.target.value)}
				/>

				<Input
					label="End Date (Optional)"
					type="date"
					value={activityEndDate}
					onChange={(e) => setActivityEndDate(e.target.value)}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<Input
					label="Start Time"
					type="time"
					disabled={activityAllDay}
					value={eventTime}
					onChange={(e) => setEventTime(e.target.value)}
				/>

				<Input
					label="End Time"
					type="time"
					disabled={activityAllDay}
					value={activityEndTime}
					onChange={(e) => setActivityEndTime(e.target.value)}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4 py-1">
				<div className="flex items-center gap-2">
					<Checkbox
						id="all-day-checkbox"
						checked={activityAllDay}
						onChange={(e) => setActivityAllDay(e.target.checked)}
					/>
					<label
						htmlFor="all-day-checkbox"
						className="text-xs font-semibold text-text-secondary cursor-pointer select-none"
					>
						All day event
					</label>
				</div>
			</div>

			<Input
				label="Location / Address"
				placeholder="e.g. Auditorium Hall C or Zoom link"
				value={eventLocation}
				onChange={(e) => setEventLocation(e.target.value)}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
						Location type
					</label>
					<div className="relative">
						<motion.button
							type="button"
							onClick={() =>
								setIsLocDropdownOpen(!isLocDropdownOpen)
							}
							animate={{
								scale: isLocDropdownOpen ? 1.01 : 1,
								boxShadow: isLocDropdownOpen
									? '0 4px 12px rgba(79, 70, 229, 0.12)'
									: '0 0px 0px rgba(0,0,0,0)',
							}}
							transition={{
								type: 'spring',
								stiffness: 400,
								damping: 25,
							}}
							className={`w-full rounded-xl bg-surface-secondary border px-3 py-2.5 flex items-center justify-between text-xs text-text-primary focus:outline-none transition-colors cursor-pointer ${
								isLocDropdownOpen
									? 'border-primary/50 ring-2 ring-primary/10'
									: 'border-border'
							}`}
						>
							<span>
								{activityLocationType === 'fixed' &&
									'📍 Fixed location'}
								{activityLocationType === 'house' &&
									"🏠 Member's house"}
								{activityLocationType === 'custom' &&
									'✏️ Type address myself'}
								{!activityLocationType &&
									'Select location type...'}
							</span>
							<FiChevronDown
								className={`transition-transform duration-200 ${isLocDropdownOpen ? 'rotate-180' : ''}`}
							/>
						</motion.button>

						<AnimatePresence>
							{isLocDropdownOpen && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() =>
											setIsLocDropdownOpen(false)
										}
									/>
									<motion.div
										initial={{
											opacity: 0,
											y: -4,
											scale: 0.98,
										}}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{
											opacity: 0,
											y: -4,
											scale: 0.98,
										}}
										transition={{ duration: 0.15 }}
										className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-lg space-y-0.5"
									>
										<button
											type="button"
											onClick={() => {
												setActivityLocationType('');
												setIsLocDropdownOpen(false);
											}}
											className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
												!activityLocationType
													? 'bg-primary/10 text-primary'
													: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
											}`}
										>
											<span>-</span>
											{!activityLocationType && (
												<FiCheckCircle size={12} />
											)}
										</button>
										<button
											type="button"
											onClick={() => {
												setActivityLocationType(
													'fixed',
												);
												setIsLocDropdownOpen(false);
											}}
											className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
												activityLocationType === 'fixed'
													? 'bg-primary/10 text-primary'
													: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
											}`}
										>
											<span className="flex items-center gap-2">
												📍 Fixed location
											</span>
											{activityLocationType ===
												'fixed' && (
												<FiCheckCircle size={12} />
											)}
										</button>
										<button
											type="button"
											onClick={() => {
												setActivityLocationType(
													'house',
												);
												setIsLocDropdownOpen(false);
											}}
											className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
												activityLocationType === 'house'
													? 'bg-primary/10 text-primary'
													: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
											}`}
										>
											<span className="flex items-center gap-2">
												🏠 Member&apos;s house
											</span>
											{activityLocationType ===
												'house' && (
												<FiCheckCircle size={12} />
											)}
										</button>
										<button
											type="button"
											onClick={() => {
												setActivityLocationType(
													'custom',
												);
												setIsLocDropdownOpen(false);
											}}
											className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
												activityLocationType ===
												'custom'
													? 'bg-primary/10 text-primary'
													: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
											}`}
										>
											<span className="flex items-center gap-2">
												✏️ Type address myself
											</span>
											{activityLocationType ===
												'custom' && (
												<FiCheckCircle size={12} />
											)}
										</button>
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</div>
				</div>

				{/* <Select
					label="Visibility"
					value={activityStatus}
					onChange={(e) => setActivityStatus(e.target.value)}
				>
					<option value="PUBLISHED">Published / Open</option>
					<option value="NOT_SENT">Draft / Closed</option>
				</Select> */}
			</div>

			<Textarea
				label="Description / Notes"
				rows={3}
				value={eventDesc}
				onChange={(e) => setEventDesc(e.target.value)}
				placeholder="Provide brief details about this activity..."
			/>
		</div>
	);
}
