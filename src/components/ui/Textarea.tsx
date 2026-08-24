'use client';

import React, { useId, useState } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	hint?: React.ReactNode;
	error?: React.ReactNode;
}

export function Textarea({ label, hint, error, className = '', id, ...props }: TextareaProps) {
	const [isFocused, setIsFocused] = useState(false);
	const generatedId = useId();
	const textareaId = id || generatedId;
	const descriptionId = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

	return (
		<div className="w-full space-y-1.5">
			{label && <label htmlFor={textareaId} className="block text-xs font-semibold text-text-secondary">{label}</label>}
			<div className={`rounded-lg border bg-surface-secondary transition-colors ${error ? 'border-danger' : isFocused ? 'border-primary/60 ring-2 ring-primary/15' : 'border-border'}`}>
				<textarea
					id={textareaId}
					onFocus={(event) => { setIsFocused(true); props.onFocus?.(event); }}
					onBlur={(event) => { setIsFocused(false); props.onBlur?.(event); }}
					className={`min-h-28 w-full resize-y bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${className}`}
					aria-invalid={Boolean(error) || undefined}
					aria-describedby={descriptionId}
					{...props}
				/>
			</div>
			{error ? <p id={`${textareaId}-error`} className="text-sm text-danger" role="alert">{error}</p> : hint ? <p id={`${textareaId}-hint`} className="text-sm text-text-muted">{hint}</p> : null}
		</div>
	);
}
