'use client';

import React, { useId } from 'react';
import { IconType } from 'react-icons';
import { FiChevronDown } from 'react-icons/fi';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	icon?: IconType;
	hint?: React.ReactNode;
	error?: React.ReactNode;
}

export function Select({ label, icon: Icon, hint, error, className = '', id, children, ...props }: SelectProps) {
	const generatedId = useId();
	const selectId = id || generatedId;
	const descriptionId = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

	return (
		<div className="w-full space-y-1.5">
			{label && <label htmlFor={selectId} className="block text-xs font-semibold text-text-secondary">{label}</label>}
			<div className={`relative flex min-h-11 items-center rounded-lg border bg-surface-secondary transition-colors ${error ? 'border-danger' : 'border-border focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15'}`}>
				{Icon && <Icon className="ml-3 shrink-0 text-text-muted" size={16} aria-hidden="true" />}
				<select
					id={selectId}
					className={`min-h-11 w-full appearance-none bg-transparent px-3 py-2 text-sm text-text-primary focus:outline-none disabled:opacity-60 ${Icon ? 'pl-2' : ''} ${className}`}
					aria-invalid={Boolean(error) || undefined}
					aria-describedby={descriptionId}
					{...props}
				>
					{children}
				</select>
				<FiChevronDown className="pointer-events-none absolute right-3 text-text-muted" size={16} aria-hidden="true" />
			</div>
			{error ? <p id={`${selectId}-error`} className="text-sm text-danger" role="alert">{error}</p> : hint ? <p id={`${selectId}-hint`} className="text-sm text-text-muted">{hint}</p> : null}
		</div>
	);
}
