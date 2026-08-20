'use client';

import React, { useId, useState, useRef, useEffect } from 'react';
import { IconType } from 'react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
	label?: string;
	icon?: IconType;
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function parseOptions(children: React.ReactNode): SelectOption[] {
	const opts: SelectOption[] = [];
	React.Children.forEach(children, (child) => {
		if (!React.isValidElement(child)) return;
		if (child.type === 'option') {
			const props = child.props as { value?: string; children?: React.ReactNode };
			opts.push({
				value: String(props.value ?? ''),
				label: String(props.children ?? props.value ?? ''),
			});
		}
	});
	return opts;
}

export function Select({
	label,
	icon: Icon,
	className = '',
	id,
	children,
	value,
	onChange,
	disabled,
	...props
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const selectId = id || useId();
	const containerRef = useRef<HTMLDivElement>(null);

	const options = parseOptions(children);
	const selectedLabel = options.find((o) => o.value === value)?.label ?? String(value ?? '');

	// Click-outside to close
	useEffect(() => {
		if (!isOpen) return;
		const handler = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [isOpen]);

	const handleSelect = (optValue: string) => {
		setIsOpen(false);
		if (onChange) {
			// Synthesize a ChangeEvent
			const syntheticEvent = {
				target: { value: optValue },
			} as React.ChangeEvent<HTMLSelectElement>;
			onChange(syntheticEvent);
		}
	};

	return (
		<div className="space-y-1.5 w-full" ref={containerRef}>
			{label && (
				<label
					htmlFor={selectId}
					className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider"
				>
					{label}
				</label>
			)}
			<div className="relative">
				<motion.button
					id={selectId}
					type="button"
					disabled={disabled}
					onClick={() => !disabled && setIsOpen((v) => !v)}
					animate={{
						scale: isOpen ? 1.02 : 1,
						boxShadow: isOpen
							? '0 4px 12px rgba(79, 70, 229, 0.12)'
							: '0 0px 0px rgba(0,0,0,0)',
					}}
					transition={{ type: 'spring', stiffness: 400, damping: 25 }}
					className={`w-full flex items-center gap-2 rounded-lg border bg-surface-secondary px-3 py-2.5 text-xs text-left transition-colors focus:outline-none ${
						isOpen
							? 'border-primary/50 ring-2 ring-primary/10'
							: 'border-border'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
				>
					{Icon && <Icon className="text-text-muted shrink-0" size={16} />}
					<span className="grow text-text-primary truncate">{selectedLabel}</span>
					<motion.span
						animate={{ rotate: isOpen ? 180 : 0 }}
						transition={{ type: 'spring', stiffness: 400, damping: 25 }}
						className="shrink-0 text-text-muted"
					>
						<FiChevronDown size={14} />
					</motion.span>
				</motion.button>

				<AnimatePresence>
					{isOpen && (
						<motion.ul
							initial={{ opacity: 0, y: -6, scale: 0.97 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -4, scale: 0.97 }}
							transition={{ type: 'spring', stiffness: 420, damping: 28 }}
							className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-surface shadow-xl overflow-hidden"
						>
							{options.map((opt) => (
								<li key={opt.value}>
									<button
										type="button"
										onClick={() => handleSelect(opt.value)}
										className={`w-full text-left px-3 py-2 text-xs transition-colors ${
											opt.value === value
												? 'bg-primary-light text-primary font-semibold'
												: 'text-text-primary hover:bg-surface-secondary'
										}`}
									>
										{opt.label}
									</button>
								</li>
							))}
						</motion.ul>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
