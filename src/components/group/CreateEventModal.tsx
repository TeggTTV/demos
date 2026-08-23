'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	FiX,
	FiCalendar,
	FiMapPin,
	FiUsers,
	FiArrowRight,
	FiArrowLeft,
	FiCheck,
} from 'react-icons/fi';
import EventBasicDetailsStep from './events/EventBasicDetailsStep';
import EventRegistrationStep from './events/EventRegistrationStep';
import EventPricingStep from './events/EventPricingStep';

interface CreateEventModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	editingActivityId: string | null;
	eventTitle: string;
	setEventTitle: (val: string) => void;
	eventDesc: string;
	setEventDesc: (val: string) => void;
	eventDate: string;
	setEventDate: (val: string) => void;
	eventTime: string;
	setEventTime: (val: string) => void;
	eventLocation: string;
	setEventLocation: (val: string) => void;
	activityEndDate: string;
	setActivityEndDate: (val: string) => void;
	activityPrice: string;
	setActivityPrice: (val: string) => void;
	activityStatus: string;
	setActivityStatus: (val: string) => void;
	activityLocationType: string;
	setActivityLocationType: (val: string) => void;
	activityAllDay: boolean;
	setActivityAllDay: (val: boolean) => void;
	activityEndTime: string;
	setActivityEndTime: (val: string) => void;
	activityRegRequired: boolean;
	setActivityRegRequired: (val: boolean) => void;
	activityRegCapacity: string;
	setActivityRegCapacity: (val: string) => void;
	activityRegDeadline: string;
	setActivityRegDeadline: (val: string) => void;
	activityMembersOnly: boolean;
	setActivityMembersOnly: (val: boolean) => void;
	modalActiveTab: 'data' | 'login' | 'costs';
	setModalActiveTab: (val: 'data' | 'login' | 'costs') => void;
	creatingEvent: boolean;
}

const STEPS: { id: 'data' | 'login' | 'costs'; label: string }[] = [
	{ id: 'data', label: '1. Basic Details' },
	{ id: 'login', label: '2. Registration & Access' },
	{ id: 'costs', label: '3. Entry Costs' },
];

export default function CreateEventModal({
	isOpen,
	onClose,
	onSubmit,
	editingActivityId,
	eventTitle,
	setEventTitle,
	eventDesc,
	setEventDesc,
	eventDate,
	setEventDate,
	eventTime,
	setEventTime,
	eventLocation,
	setEventLocation,
	activityEndDate,
	setActivityEndDate,
	activityPrice,
	setActivityPrice,
	activityStatus,
	setActivityStatus,
	activityLocationType,
	setActivityLocationType,
	activityAllDay,
	setActivityAllDay,
	activityEndTime,
	setActivityEndTime,
	activityRegRequired,
	setActivityRegRequired,
	activityRegCapacity,
	setActivityRegCapacity,
	activityRegDeadline,
	setActivityRegDeadline,
	activityMembersOnly,
	setActivityMembersOnly,
	modalActiveTab,
	setModalActiveTab,
	creatingEvent,
}: CreateEventModalProps) {
	const currentStepIndex = STEPS.findIndex((s) => s.id === modalActiveTab);
	const [maxReachedStep, setMaxReachedStep] = useState(0);

	const handleStepClick = (index: number) => {
		if (index <= maxReachedStep || editingActivityId) {
			setModalActiveTab(STEPS[index].id);
		}
	};

	const goToNextStep = () => {
		if (currentStepIndex < STEPS.length - 1) {
			const nextIdx = currentStepIndex + 1;
			setMaxReachedStep((prev) => Math.max(prev, nextIdx));
			setModalActiveTab(STEPS[nextIdx].id);
		}
	};

	const goToPrevStep = () => {
		if (currentStepIndex > 0) {
			setModalActiveTab(STEPS[currentStepIndex - 1].id);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
					>
						{/* Modal Header */}
						<div className="flex items-start justify-between border-b border-border pb-3">
							<div className="space-y-1 grow">
								<h3 className="text-base font-bold text-text-primary">
									{editingActivityId
										? 'Edit Activity'
										: 'Add activity'}
								</h3>

								{/* Subtitle live metadata */}
								<div className="text-[11px] text-text-muted space-y-0.5">
									<span className="font-semibold block truncate">
										{eventTitle || (
											<span className="italic">
												No title yet
											</span>
										)}
									</span>
									<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
										<span className="flex items-center gap-1">
											<FiCalendar
												size={11}
												className="text-primary shrink-0"
											/>
											<span>
												{eventDate
													? new Date(
															eventDate,
													  ).toLocaleDateString(
															'en-US',
															{
																weekday: 'short',
																day: 'numeric',
																month: 'short',
																year: 'numeric',
															},
													  )
													: 'No date yet'}
												{!activityAllDay &&
													eventTime &&
													` , ${eventTime}`}
											</span>
										</span>

										<span className="flex items-center gap-1">
											<FiMapPin
												size={11}
												className="text-primary shrink-0"
											/>
											<span className="truncate max-w-37.5">
												{eventLocation ||
													'No location yet'}
											</span>
										</span>

										<span className="flex items-center gap-1">
											<FiUsers
												size={11}
												className="text-primary shrink-0"
											/>
											<span>
												{activityStatus === 'PUBLISHED'
													? 'All members'
													: 'Draft / Not sent'}
											</span>
										</span>
									</div>
								</div>
							</div>
							<button
								onClick={onClose}
								className="text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
							>
								<FiX size={16} />
							</button>
						</div>

						{/* Sequential Steps Navigation Header */}
						<div className="border-b border-border pb-3 space-y-2">
							<div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
								<span>
									Step {currentStepIndex + 1} of {STEPS.length}
								</span>
								<span className="text-primary font-bold">
									{STEPS[currentStepIndex].label}
								</span>
							</div>

							{/* Progress Bar */}
							<div className="w-full bg-surface-secondary h-1.5 rounded-full overflow-hidden">
								<div
									className="bg-primary h-full transition-all duration-300 rounded-full"
									style={{
										width: `${
											((currentStepIndex + 1) /
												STEPS.length) *
											100
										}%`,
									}}
								/>
							</div>

							{/* Step Pill Buttons */}
							<div className="grid grid-cols-3 gap-1.5 pt-1">
								{STEPS.map((step, idx) => {
									const isActive = currentStepIndex === idx;
									const isCompleted =
										idx < currentStepIndex ||
										idx <= maxReachedStep;
									const canClick =
										idx <= maxReachedStep ||
										Boolean(editingActivityId);

									return (
										<button
											key={step.id}
											type="button"
											disabled={!canClick}
											onClick={() => handleStepClick(idx)}
											className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
												isActive
													? 'bg-primary text-white shadow-xs'
													: isCompleted
													? 'bg-primary-light text-primary hover:opacity-90 cursor-pointer'
													: 'bg-surface-secondary/40 text-text-muted opacity-60 cursor-not-allowed'
											}`}
										>
											{step.label}
										</button>
									);
								})}
							</div>
						</div>

						{/* Form Step Body */}
						<form onSubmit={onSubmit} className="space-y-4">
							{modalActiveTab === 'data' && (
								<EventBasicDetailsStep
									eventTitle={eventTitle}
									setEventTitle={setEventTitle}
									eventDate={eventDate}
									setEventDate={setEventDate}
									eventTime={eventTime}
									setEventTime={setEventTime}
									eventLocation={eventLocation}
									setEventLocation={setEventLocation}
									activityEndDate={activityEndDate}
									setActivityEndDate={setActivityEndDate}
									activityEndTime={activityEndTime}
									setActivityEndTime={setActivityEndTime}
									activityAllDay={activityAllDay}
									setActivityAllDay={setActivityAllDay}
									activityLocationType={activityLocationType}
									setActivityLocationType={
										setActivityLocationType
									}
									activityStatus={activityStatus}
									setActivityStatus={setActivityStatus}
									eventDesc={eventDesc}
									setEventDesc={setEventDesc}
								/>
							)}

							{modalActiveTab === 'login' && (
								<EventRegistrationStep
									activityMembersOnly={activityMembersOnly}
									setActivityMembersOnly={
										setActivityMembersOnly
									}
									activityRegRequired={activityRegRequired}
									setActivityRegRequired={
										setActivityRegRequired
									}
									activityRegCapacity={activityRegCapacity}
									setActivityRegCapacity={
										setActivityRegCapacity
									}
									activityRegDeadline={activityRegDeadline}
									setActivityRegDeadline={
										setActivityRegDeadline
									}
								/>
							)}

							{modalActiveTab === 'costs' && (
								<EventPricingStep
									activityPrice={activityPrice}
									setActivityPrice={setActivityPrice}
								/>
							)}

							{/* Stepper Navigation Footer Actions */}
							<div className="flex items-center justify-between border-t border-border pt-4">
								<div>
									{currentStepIndex > 0 ? (
										<button
											type="button"
											onClick={goToPrevStep}
											className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer"
										>
											<FiArrowLeft size={13} />
											<span>Back</span>
										</button>
									) : (
										<button
											type="button"
											onClick={onClose}
											className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer hover:bg-surface-secondary transition-colors"
										>
											Cancel
										</button>
									)}
								</div>

								<div className="flex items-center gap-2">
									{currentStepIndex < STEPS.length - 1 ? (
										<button
											type="button"
											onClick={goToNextStep}
											className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
										>
											<span>Next</span>
											<FiArrowRight size={13} />
										</button>
									) : (
										<button
											type="submit"
											disabled={
												creatingEvent ||
												!eventTitle.trim()
											}
											className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-all cursor-pointer"
										>
											<FiCheck size={14} />
											<span>
												{creatingEvent
													? 'Saving...'
													: editingActivityId
													? 'Update Activity'
													: 'Create Activity'}
											</span>
										</button>
									)}
								</div>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
