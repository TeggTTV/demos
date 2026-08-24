'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { IconType } from 'react-icons';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
	value: string;
	label: string;
	group?: string;
}

interface SelectProps {
	label?: string;
	icon?: IconType;
	hint?: React.ReactNode;
	error?: React.ReactNode;
	value?: string;
	onChange?: (e: { target: { value: string } }) => void;
	children?: React.ReactNode;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	id?: string;
}

export function Select({
	label,
	icon: Icon,
	hint,
	error,
	value,
	onChange,
	children,
	placeholder = 'Select an option',
	className = '',
	disabled = false,
	id,
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const generatedId = useId();
	const selectId = id || generatedId;

	// Extract options from children if passed as <option> or <optgroup>
	const options: SelectOption[] = [];
	React.Children.forEach(children, (child) => {
		if (!React.isValidElement(child)) return;
		if (child.type === 'option') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const props = child.props as any;
			options.push({
				value: String(props.value ?? props.children),
				label: String(props.children),
			});
		} else if (child.type === 'optgroup') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const groupProps = child.props as any;
			const groupLabel = groupProps.label;
			React.Children.forEach(groupProps.children, (optChild) => {
				if (React.isValidElement(optChild) && optChild.type === 'option') {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const optProps = optChild.props as any;
					options.push({
						value: String(optProps.value ?? optProps.children),
						label: String(optProps.children),
						group: groupLabel,
					});
				}
			});
		}
	});

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	const selectedOption = options.find((opt) => opt.value === value);
	const displayText = selectedOption
		? selectedOption.label
		: value || placeholder;

	const handleSelect = (val: string) => {
		if (onChange) {
			onChange({ target: { value: val } });
		}
		setIsOpen(false);
	};

	// Group options by group label if optgroup exists
	const grouped: { [key: string]: SelectOption[] } = {};
	options.forEach((opt) => {
		const gKey = opt.group || '';
		if (!grouped[gKey]) grouped[gKey] = [];
		grouped[gKey].push(opt);
	});

	return (
		<div className="w-full space-y-1.5 relative" ref={dropdownRef}>
			{label && (
				<label
					htmlFor={selectId}
					className="block text-xs font-semibold text-text-secondary select-none"
				>
					{label}
				</label>
			)}

			<button
				id={selectId}
				type="button"
				disabled={disabled}
				onClick={() => !disabled && setIsOpen((prev) => !prev)}
				className={`w-full flex min-h-11 items-center justify-between gap-2 rounded-xl border bg-surface-secondary px-3.5 py-2.5 text-xs text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
					error
						? 'border-danger'
						: isOpen
							? 'border-primary ring-2 ring-primary/15 shadow-sm'
							: 'border-border hover:border-text-muted/40'
				} ${className}`}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				<div className="flex items-center gap-2 min-w-0 truncate">
					{Icon && (
						<Icon
							className="shrink-0 text-text-muted"
							size={15}
							aria-hidden="true"
						/>
					)}
					<span
						className={`truncate block font-medium ${
							selectedOption
								? 'text-text-primary'
								: 'text-text-muted'
						}`}
					>
						{displayText}
					</span>
				</div>

				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.15 }}
					className="shrink-0 text-text-muted"
				>
					<FiChevronDown size={15} aria-hidden="true" />
				</motion.div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -4, scale: 0.98 }}
						transition={{ duration: 0.14, ease: 'easeOut' }}
						className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl space-y-1"
						role="listbox"
					>
						{Object.entries(grouped).map(([groupName, groupOpts]) => (
							<div key={groupName} className="space-y-0.5">
								{groupName && (
									<div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-surface-secondary/50 rounded-md my-0.5">
										{groupName}
									</div>
								)}
								{groupOpts.map((opt) => {
									const isSelected = opt.value === value;
									return (
										<button
											key={opt.value}
											type="button"
											role="option"
											aria-selected={isSelected}
											onClick={() =>
												handleSelect(opt.value)
											}
											className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
												isSelected
													? 'bg-primary-light text-primary'
													: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
											}`}
										>
											<span className="truncate">
												{opt.label}
											</span>
											{isSelected && (
												<FiCheck
													size={13}
													className="shrink-0 text-primary"
												/>
											)}
										</button>
									);
								})}
							</div>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{error ? (
				<p id={`${selectId}-error`} className="text-xs text-danger" role="alert">
					{error}
				</p>
			) : hint ? (
				<p id={`${selectId}-hint`} className="text-xs text-text-muted">
					{hint}
				</p>
			) : null}
		</div>
	);
}
